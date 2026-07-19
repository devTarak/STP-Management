import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { ReactCrop, convertToPixelCrop, makeAspectCrop, centerCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { useParams, useSearchParams } from 'react-router-dom';
import {
  Box, Paper, Typography, Grid, Button, TextField, Stack,
  MenuItem, Checkbox, FormControlLabel,
  Alert, Avatar, LinearProgress, Divider, InputAdornment,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
  Tooltip, IconButton, useMediaQuery, useTheme,
} from '@mui/material';
import {
  CloudUpload, CheckCircle, ArrowForward, ArrowBack,
  School, ContactMail, Map, Description, HowToReg,
  Delete, RestartAlt,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import api from '@/config/api';
import { registrationService } from '@/services/registrationService';
import { getErrorMessage, getFieldErrors } from '@/utils/errorHandler';
import { useQuery } from '@tanstack/react-query';
import { useDivisions, useDistricts, useUpazilas } from '@/hooks/useBdAddress';

const genders = ['Male', 'Female', 'Other'];
const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
const idTypes = ['NID', 'Birth Certificate', 'Passport'];
const religions = ['Islam', 'Hinduism', 'Christianity', 'Buddhism', 'Other'];
const maxFileSize = 5 * 1024 * 1024;

const steps = ['Course & Personal', 'Contact & Identity', 'Address & Education', 'Documents & Submit'];
const stepIcons = [<School />, <ContactMail />, <Map />, <Description />];

const requiredFields = [
  'course_name', 'batch_id', 'name_en', 'name_bn',
  'father_name_en', 'father_name_bn', 'mother_name_en', 'mother_name_bn',
  'date_of_birth', 'gender',
  'contact_no', 'email', 'religion',
  'occupation', 'blood_group', 'guardian_contact', 'guardian_relation',
  'present_village', 'present_po', 'present_upazila', 'present_district', 'present_division',
  'perm_village', 'perm_po', 'perm_upazila', 'perm_district', 'perm_division',
  'edu_degree', 'edu_institute', 'edu_year', 'edu_cgpa', 'edu_address',
  'photo_path', 'signature_path', 'nid_path',
];

function calcCompletion(form) {
  const filled = requiredFields.filter((f) => form[f] && form[f].toString().trim() !== '');
  return Math.round((filled.length / requiredFields.length) * 100);
}

const initialForm = {
  course_name: '', batch_id: '',
  name_en: '', name_bn: '',
  father_name_en: '', father_name_bn: '',
  mother_name_en: '', mother_name_bn: '',
  date_of_birth: '', gender: '',
  contact_no: '', email: '',
  religion: '', nationality: 'Bangladeshi',
  id_type: '', id_number: '',
  occupation: '', blood_group: '',
  guardian_contact: '', guardian_relation: '',
  present_village: '', present_road: '', present_po: '',
  present_upazila: '', present_district: '', present_division: '',
  perm_village: '', perm_road: '', perm_po: '',
  perm_upazila: '', perm_district: '', perm_division: '',
  edu_degree: '', edu_institute: '', edu_year: '', edu_cgpa: '', edu_address: '',
  photo_path: '', signature_path: '', nid_path: '',
  declaration: false,
};

function MobileStepDots({ active, count }) {
  return (
    <Stack direction="row" spacing={1} justifyContent="center" alignItems="center" sx={{ py: 1.5 }}>
      {Array.from({ length: count }, (_, i) => (
        <Box
          key={i}
          sx={{
            width: i === active ? 24 : 10,
            height: 10,
            borderRadius: 5,
            bgcolor: i === active ? 'primary.main' : i < active ? 'success.main' : 'grey.300',
            transition: 'all 0.3s',
          }}
        />
      ))}
    </Stack>
  );
}

export default function PublicRegistrationPage() {
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'));
  const isSmUp = useMediaQuery(theme.breakpoints.up('sm'));
  const { instituteTitle } = useParams();
  const [searchParams] = useSearchParams();
  const [activeStep, setActiveStep] = useState(0);
  const [resetDialog, setResetDialog] = useState(false);
  const [sameAddress, setSameAddress] = useState(false);
  const [presentDivisionId, setPresentDivisionId] = useState('');
  const [presentDistrictId, setPresentDistrictId] = useState('');
  const [presentUpazilaId, setPresentUpazilaId] = useState('');
  const [permDivisionId, setPermDivisionId] = useState('');
  const [permDistrictId, setPermDistrictId] = useState('');
  const [permUpazilaId, setPermUpazilaId] = useState('');
  const uploadedFiles = useRef([]);
  const currentUploads = useRef({ photo: null, sig: null, nid: null });

  const urlCourse = searchParams.get('course_name') || '';
  const urlBatch = searchParams.get('batch_id') || '';
  const initialFromUrl = urlCourse ? { ...initialForm, course_name: urlCourse, batch_id: urlBatch } : initialForm;
  const [form, setForm] = useState(initialFromUrl);
  const [errors, setErrors] = useState({});
  const [liveErrors, setLiveErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [refNo, setRefNo] = useState('');
  const [uploading, setUploading] = useState({ photo: false, sig: false, nid: false });
  const [uploadProgress, setUploadProgress] = useState({ photo: 0, sig: 0, nid: 0 });
  const [cropOpen, setCropOpen] = useState(false);
  const [cropType, setCropType] = useState(null);
  const [cropFile, setCropFile] = useState(null);
  const [cropSrc, setCropSrc] = useState('');
  const [crop, setCrop] = useState(null);
  const imgRef = useRef(null);

  const { data: courses } = useQuery({
    queryKey: ['public-courses', instituteTitle],
    queryFn: async () => {
      const res = await api.get(`/public/institute/${instituteTitle}/programs`);
      return res.data?.data?.courses ?? [];
    },
    enabled: !!instituteTitle,
  });

  const coursesList = courses ?? [];
  const selectedCourse = coursesList.find((c) => c.course_name === form.course_name);
  const batches = selectedCourse?.batches ?? [];

  const { data: divisions = [] } = useDivisions();
  const { data: districts = [] } = useDistricts(presentDivisionId || null);
  const { data: upazilas = [] } = useUpazilas(presentDistrictId || null);
  const { data: permDistricts = [] } = useDistricts(permDivisionId || null);
  const { data: permUpazilas = [] } = useUpazilas(permDistrictId || null);

  const completions = useMemo(() => calcCompletion(form), [form]);

  const validatePhone = (v) => {
    if (!v?.trim()) return 'Phone number is required';
    if (!/^01[3-9]\d{8}$/.test(v.trim())) return 'Enter a valid Bangladeshi number (01XXXXXXXXX)';
    return '';
  };

  const validateEmail = (v) => {
    if (!v?.trim()) return 'Email is required';
    if (!/\S+@\S+\.\S+/.test(v)) return 'Enter a valid email address';
    return '';
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));

    if (name === 'contact_no') {
      setLiveErrors((prev) => ({ ...prev, contact_no: validatePhone(value) }));
    }
    if (name === 'guardian_contact') {
      setLiveErrors((prev) => ({ ...prev, guardian_contact: validatePhone(value) }));
    }
    if (name === 'email') {
      setLiveErrors((prev) => ({ ...prev, email: validateEmail(value) }));
    }
  };

  useEffect(() => {
    if (sameAddress) {
      setForm((prev) => ({
        ...prev,
        perm_village: prev.present_village,
        perm_road: prev.present_road,
        perm_po: prev.present_po,
        perm_upazila: prev.present_upazila,
        perm_district: prev.present_district,
        perm_division: prev.present_division,
      }));
      setPermDivisionId(presentDivisionId);
      setPermDistrictId(presentDistrictId);
      setPermUpazilaId(presentUpazilaId);
    }
  }, [
    sameAddress,
    form.present_village, form.present_road, form.present_po,
    form.present_upazila, form.present_district, form.present_division,
    presentDivisionId, presentDistrictId, presentUpazilaId,
  ]);

  useEffect(() => {
    const cleanup = () => {
      if (uploadedFiles.current.length > 0) {
        fetch('/api/registration/delete-file', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paths: uploadedFiles.current }),
          keepalive: true,
        });
      }
    };
    window.addEventListener('beforeunload', cleanup);
    return () => {
      window.removeEventListener('beforeunload', cleanup);
      cleanup();
    };
  }, []);

  const handleUpload = async (file, type) => {
    const key = type === 'photo' ? 'photo' : type === 'sig' ? 'sig' : 'nid';
    const field = type === 'photo' ? 'photo_path' : type === 'sig' ? 'signature_path' : 'nid_path';
    const oldPath = currentUploads.current[key];
    setUploading((prev) => ({ ...prev, [key]: true }));
    setUploadProgress((prev) => ({ ...prev, [key]: 0 }));
    try {
      const res = await registrationService.uploadFile(file, type, (progressEvent) => {
        const pct = Math.round((progressEvent.loaded / progressEvent.total) * 100);
        setUploadProgress((prev) => ({ ...prev, [key]: pct }));
      });
      if (res?.success && res.data?.path) {
        if (oldPath) {
          registrationService.deleteFile(oldPath).catch(() => {});
          uploadedFiles.current = uploadedFiles.current.filter((p) => p !== oldPath);
        }
        currentUploads.current[key] = res.data.path;
        setForm((prev) => ({ ...prev, [field]: res.data.path }));
        uploadedFiles.current.push(res.data.path);
      } else {
        alert(res?.message || 'Upload failed');
      }
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setUploading((prev) => ({ ...prev, [key]: false }));
      setUploadProgress((prev) => ({ ...prev, [key]: 0 }));
    }
  };

  const handleCropConfirm = useCallback(async () => {
    if (!cropSrc || !cropFile || !cropType || !crop) return;
    const img = new Image();
    img.src = cropSrc;
    await new Promise((resolve) => { img.onload = resolve; });
    const canvas = document.createElement('canvas');
    const pixelCrop = convertToPixelCrop(crop, img.width, img.height);
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, pixelCrop.width, pixelCrop.height);
    canvas.toBlob((blob) => {
      if (!blob) { alert('Crop failed'); return; }
      const croppedFile = new File([blob], cropFile.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' });
      URL.revokeObjectURL(cropSrc);
      setCropOpen(false);
      handleUpload(croppedFile, cropType);
    }, 'image/jpeg', 0.92);
  }, [cropSrc, cropFile, cropType, crop]);

  const handleRemoveFile = async (field, path) => {
    try {
      const res = await registrationService.deleteFile(path);
      if (!res?.success) {
        console.warn('Server delete failed:', res?.message);
      }
    } catch (err) {
      console.warn('Server delete error:', err);
    }
    setForm((prev) => ({ ...prev, [field]: '' }));
    uploadedFiles.current = uploadedFiles.current.filter((p) => p !== path);
    const key = field === 'photo_path' ? 'photo' : field === 'signature_path' ? 'sig' : 'nid';
    if (currentUploads.current[key] === path) {
      currentUploads.current[key] = null;
    }
  };

  const validateStep = (step) => {
    const errs = {};
    if (step === 0) {
      if (!form.course_name) errs.course_name = 'Course is required';
      if (!form.batch_id) errs.batch_id = 'Batch is required';
      if (!form.name_en?.trim()) errs.name_en = 'Name is required';
      if (!form.name_bn?.trim()) errs.name_bn = 'Bangla name is required';
      if (!form.father_name_en?.trim()) errs.father_name_en = "Father's name is required";
      if (!form.father_name_bn?.trim()) errs.father_name_bn = "Father's bangla name is required";
      if (!form.mother_name_en?.trim()) errs.mother_name_en = "Mother's name is required";
      if (!form.mother_name_bn?.trim()) errs.mother_name_bn = "Mother's bangla name is required";
      if (!form.date_of_birth) errs.date_of_birth = 'Date of birth is required';
      if (!form.gender) errs.gender = 'Gender is required';
    }
    if (step === 1) {
      if (!form.contact_no?.trim()) errs.contact_no = 'Contact no is required';
      else if (!/^01[3-9]\d{8}$/.test(form.contact_no.trim())) errs.contact_no = 'Invalid Bangladeshi phone number';
      if (!form.email?.trim()) errs.email = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email';
      if (!form.religion) errs.religion = 'Religion is required';
      if (!form.id_type) errs.id_type = 'ID type is required';
      if (!form.id_number?.trim()) errs.id_number = 'ID number is required';
      if (!form.occupation?.trim()) errs.occupation = 'Occupation is required';
      if (!form.blood_group) errs.blood_group = 'Blood group is required';
      if (!form.guardian_contact?.trim()) errs.guardian_contact = 'Guardian contact is required';
      else if (!/^01[3-9]\d{8}$/.test(form.guardian_contact.trim())) errs.guardian_contact = 'Invalid phone number';
      if (!form.guardian_relation?.trim()) errs.guardian_relation = 'Guardian relation is required';
    }
    if (step === 2) {
      if (!form.present_village?.trim()) errs.present_village = 'Village is required';
      if (!form.present_po?.trim()) errs.present_po = 'Post office is required';
      if (!form.present_upazila?.trim()) errs.present_upazila = 'Upazila is required';
      if (!form.present_district?.trim()) errs.present_district = 'District is required';
      if (!form.present_division) errs.present_division = 'Division is required';
      if (!form.perm_village?.trim()) errs.perm_village = 'Village is required';
      if (!form.perm_po?.trim()) errs.perm_po = 'Post office is required';
      if (!form.perm_upazila?.trim()) errs.perm_upazila = 'Upazila is required';
      if (!form.perm_district?.trim()) errs.perm_district = 'District is required';
      if (!form.perm_division) errs.perm_division = 'Division is required';
      if (!form.edu_degree?.trim()) errs.edu_degree = 'Degree is required';
      if (!form.edu_institute?.trim()) errs.edu_institute = 'Institute is required';
      if (!form.edu_year) errs.edu_year = 'Passing year is required';
      if (!form.edu_cgpa?.trim()) errs.edu_cgpa = 'CGPA is required';
      if (!form.edu_address?.trim()) errs.edu_address = 'Address is required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prev) => prev + 1);
      setApiError('');
    }
  };

  const handleBack = () => setActiveStep((prev) => prev - 1);

  const handleReset = () => {
    setForm(initialFromUrl);
    setErrors({});
    setLiveErrors({});
    setApiError('');
    setActiveStep(0);
    setSameAddress(false);
    uploadedFiles.current = [];
    currentUploads.current = { photo: null, sig: null, nid: null };
    setResetDialog(false);
  };

  const handleSubmit = async () => {
    if (!form.declaration) {
      setApiError('Please accept the declaration to submit.');
      return;
    }
    setSubmitting(true);
    setApiError('');
    try {
      const payload = { ...form, institute_slug: instituteTitle };
      const res = await registrationService.register(payload);
      if (res?.success) {
        setRefNo(res.data?.ref_no || '');
        setSubmitted(true);
        uploadedFiles.current = [];
        currentUploads.current = { photo: null, sig: null, nid: null };
      } else {
        setApiError(res?.message || 'Registration failed.');
        const fieldErrors = res?.errors;
        if (fieldErrors && typeof fieldErrors === 'object') setErrors(fieldErrors);
      }
    } catch (err) {
      setApiError(getErrorMessage(err));
      const fieldErrors = getFieldErrors(err);
      if (fieldErrors && typeof fieldErrors === 'object') setErrors(fieldErrors);
    } finally {
      setSubmitting(false);
    }
  };

  const getFileUrl = (path) => path ? `/${path.replace(/^\//, '')}` : '';

  const fileSpecs = {
    photo: { label: 'Photograph', accept: 'image/jpeg,image/png', hint: '300x300px, JPG/PNG' },
    sig: { label: 'Signature', accept: 'image/jpeg,image/png', hint: '300x100px, JPG/PNG' },
    nid: { label: 'NID / Birth Cert', accept: 'image/jpeg,image/png,application/pdf', hint: 'Max 1MB, JPG/PNG/PDF' },
  };

  const renderFileUpload = (type) => {
    const spec = fileSpecs[type];
    const field = type === 'photo' ? 'photo_path' : type === 'sig' ? 'signature_path' : 'nid_path';
    const isUploading = uploading[type];
    const progress = uploadProgress[type];
    const value = form[field];
    const isImage = value && /\.(jpg|jpeg|png|gif)$/i.test(value);

    return (
      <Paper variant="outlined" sx={{ p: { xs: 2, sm: 2.5 }, borderRadius: 2, textAlign: 'center', height: '100%' }}>
        {value ? (
          <Stack spacing={1.5} alignItems="center">
            {isImage ? (
              <Box
                component="img"
                src={getFileUrl(value)}
                alt={spec.label}
                sx={{
                  width: { xs: 100, sm: 120 }, height: { xs: 100, sm: 120 },
                  objectFit: 'cover', borderRadius: 1,
                  border: '1px solid', borderColor: 'divider',
                }}
              />
            ) : (
              <Avatar sx={{ bgcolor: 'success.light', width: 48, height: 48 }}>
                <CheckCircle />
              </Avatar>
            )}
            <Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-all', fontSize: '0.75rem' }}>
              {value.split('/').pop()}
            </Typography>
            <IconButton size="small" color="error" onClick={() => handleRemoveFile(field, value)}>
              <Delete fontSize="small" />
            </IconButton>
          </Stack>
        ) : (
          <Stack spacing={1.5} alignItems="center">
            <Avatar sx={{ bgcolor: 'action.hover', width: 48, height: 48 }}>
              <CloudUpload color="action" />
            </Avatar>
            <Typography variant="body2" fontWeight={500}>{spec.label}</Typography>
            <Typography variant="caption" color="text.secondary">{spec.hint}</Typography>
            <Button variant="outlined" size="small" component="label" disabled={isUploading} fullWidth>
              {isUploading ? `${progress}%` : 'Choose File'}
              <input
                type="file"
                hidden
                accept={spec.accept}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  if (file.size > maxFileSize) { alert('File must be under 5MB.'); return; }
                  if (type === 'photo' || type === 'sig') {
                    const src = URL.createObjectURL(file);
                    const img = new Image();
                    img.src = src;
                    img.onload = () => {
                      const aspect = type === 'photo' ? 1 : 3;
                      const pc = centerCrop(
                        makeAspectCrop({ unit: '%', width: 100, height: 100 }, aspect, img.naturalWidth, img.naturalHeight),
                        img.naturalWidth,
                        img.naturalHeight,
                      );
                      setCrop(pc);
                    };
                    setCropType(type);
                    setCropFile(file);
                    setCropSrc(src);
                    setCropOpen(true);
                  } else {
                    handleUpload(file, type);
                  }
                  e.target.value = '';
                }}
              />
            </Button>
            {isUploading && (
              <LinearProgress variant="determinate" value={progress} sx={{ width: '100%', borderRadius: 1 }} />
            )}
          </Stack>
        )}
      </Paper>
    );
  };

  const textFieldProps = { fullWidth: true, size: 'small', sx: { minWidth: 140 } };
  const selectFieldProps = {
    ...textFieldProps,
    SelectProps: {
      MenuProps: {
        PaperProps: {
          sx: { maxWidth: 'calc(100vw - 32px)', maxHeight: 300 },
        },
      },
    },
    sx: {
      ...textFieldProps.sx,
      '& .MuiSelect-select': {
        whiteSpace: 'normal',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        minHeight: '1.4375em',
      },
    },
  };

  const renderCourseStep = () => (
    <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
      <Grid container spacing={{ xs: 2, sm: 2.5 }}>
        <Grid item xs={12}>
          <Typography variant={{ xs: 'body1', sm: 'subtitle1' }} fontWeight={600} gutterBottom>
            Select Course & Batch
          </Typography>
        </Grid>
        <Grid item xs={12} sm="auto">
          <TextField {...selectFieldProps} select label="Course" name="course_name"
            value={form.course_name} onChange={handleChange}
            error={!!errors.course_name} helperText={errors.course_name}>
            {coursesList.map((c) => (
              <MenuItem key={c.id} value={c.course_name}>{c.course_name}</MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12} sm="auto">
          <TextField {...selectFieldProps} select label="Batch" name="batch_id"
            value={form.batch_id} onChange={handleChange}
            error={!!errors.batch_id} helperText={errors.batch_id}
            disabled={!form.course_name}>
            {batches.map((b) => (
              <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12}><Divider sx={{ my: 0.5 }} /></Grid>
        <Grid item xs={12}>
          <Typography variant={{ xs: 'body1', sm: 'subtitle1' }} fontWeight={600} gutterBottom>
            Personal Information
          </Typography>
        </Grid>
        <Grid item xs={12} sm="auto">
          <TextField {...textFieldProps} label="Name (English)" name="name_en"
            value={form.name_en} onChange={handleChange}
            error={!!errors.name_en} helperText={errors.name_en} />
        </Grid>
        <Grid item xs={12} sm="auto">
          <TextField {...textFieldProps} label="Name (Bangla)" name="name_bn"
            value={form.name_bn} onChange={handleChange}
            error={!!errors.name_bn} helperText={errors.name_bn} />
        </Grid>
        <Grid item xs={12} sm="auto">
          <TextField {...textFieldProps} label="Father's Name (English)" name="father_name_en"
            value={form.father_name_en} onChange={handleChange}
            error={!!errors.father_name_en} helperText={errors.father_name_en} />
        </Grid>
        <Grid item xs={12} sm="auto">
          <TextField {...textFieldProps} label="Father's Name (Bangla)" name="father_name_bn"
            value={form.father_name_bn} onChange={handleChange}
            error={!!errors.father_name_bn} helperText={errors.father_name_bn} />
        </Grid>
        <Grid item xs={12} sm="auto">
          <TextField {...textFieldProps} label="Mother's Name (English)" name="mother_name_en"
            value={form.mother_name_en} onChange={handleChange}
            error={!!errors.mother_name_en} helperText={errors.mother_name_en} />
        </Grid>
        <Grid item xs={12} sm="auto">
          <TextField {...textFieldProps} label="Mother's Name (Bangla)" name="mother_name_bn"
            value={form.mother_name_bn} onChange={handleChange}
            error={!!errors.mother_name_bn} helperText={errors.mother_name_bn} />
        </Grid>
        <Grid item xs={12} sm="auto">
          <TextField {...textFieldProps} label="Date of Birth" name="date_of_birth" type="date"
            value={form.date_of_birth} onChange={handleChange}
            InputLabelProps={{ shrink: true }}
            error={!!errors.date_of_birth} helperText={errors.date_of_birth} />
        </Grid>
        <Grid item xs={12} sm="auto">
          <TextField {...selectFieldProps} select label="Gender" name="gender"
            value={form.gender} onChange={handleChange}
            error={!!errors.gender} helperText={errors.gender}>
            {genders.map((g) => <MenuItem key={g} value={g}>{g}</MenuItem>)}
          </TextField>
        </Grid>
      </Grid>
    </motion.div>
  );

  const renderContactStep = () => (
    <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
      <Grid container spacing={{ xs: 2, sm: 2.5 }}>
        <Grid item xs={12}>
          <Typography variant={{ xs: 'body1', sm: 'subtitle1' }} fontWeight={600} gutterBottom>
            Contact & Identity
          </Typography>
        </Grid>
        <Grid item xs={12} sm="auto">
          <TextField {...textFieldProps} label="Contact No" name="contact_no"
            value={form.contact_no} onChange={handleChange}
            error={!!errors.contact_no || !!liveErrors.contact_no}
            helperText={liveErrors.contact_no || errors.contact_no}
            placeholder="01XXXXXXXXX"
            InputProps={{
              startAdornment: <InputAdornment position="start">+880</InputAdornment>,
            }} />
        </Grid>
        <Grid item xs={12} sm="auto">
          <TextField {...textFieldProps} label="Email" name="email" type="email"
            value={form.email} onChange={handleChange}
            error={!!errors.email || !!liveErrors.email}
            helperText={liveErrors.email || errors.email} />
        </Grid>
        <Grid item xs={12} sm="auto">
          <TextField {...selectFieldProps} select label="Religion" name="religion"
            value={form.religion} onChange={handleChange}
            error={!!errors.religion} helperText={errors.religion}>
            {religions.map((r) => <MenuItem key={r} value={r}>{r}</MenuItem>)}
          </TextField>
        </Grid>
        <Grid item xs={12} sm="auto">
          <TextField {...textFieldProps} label="Nationality" name="nationality"
            value={form.nationality} onChange={handleChange} />
        </Grid>
        <Grid item xs={12} sm="auto">
          <TextField {...selectFieldProps} select label="ID Type" name="id_type"
            value={form.id_type} onChange={handleChange}
            error={!!errors.id_type} helperText={errors.id_type}>
            <MenuItem value=""><em>None</em></MenuItem>
            {idTypes.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
          </TextField>
        </Grid>
        <Grid item xs={12} sm="auto">
          <TextField {...textFieldProps} label="ID Number" name="id_number"
            value={form.id_number} onChange={handleChange} disabled={!form.id_type}
            error={!!errors.id_number} helperText={errors.id_number} />
        </Grid>
        <Grid item xs={12} sm="auto">
          <TextField {...textFieldProps} label="Occupation" name="occupation"
            value={form.occupation} onChange={handleChange}
            error={!!errors.occupation} helperText={errors.occupation} />
        </Grid>
        <Grid item xs={12} sm="auto">
          <TextField {...selectFieldProps} select label="Blood Group" name="blood_group"
            value={form.blood_group} onChange={handleChange}
            error={!!errors.blood_group} helperText={errors.blood_group}>
            <MenuItem value=""><em>None</em></MenuItem>
            {bloodGroups.map((b) => <MenuItem key={b} value={b}>{b}</MenuItem>)}
          </TextField>
        </Grid>
        <Grid item xs={12} sm="auto">
          <TextField {...textFieldProps} label="Guardian Contact" name="guardian_contact"
            value={form.guardian_contact} onChange={handleChange}
            error={!!errors.guardian_contact || !!liveErrors.guardian_contact}
            helperText={liveErrors.guardian_contact || errors.guardian_contact}
            placeholder="01XXXXXXXXX"
            InputProps={{
              startAdornment: <InputAdornment position="start">+880</InputAdornment>,
            }} />
        </Grid>
        <Grid item xs={12} sm="auto">
          <TextField {...textFieldProps} label="Guardian Relation" name="guardian_relation"
            value={form.guardian_relation} onChange={handleChange}
            error={!!errors.guardian_relation} helperText={errors.guardian_relation} />
        </Grid>
      </Grid>
    </motion.div>
  );

  const renderAddressStep = () => (
    <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
      <Grid container spacing={{ xs: 2, sm: 2.5 }}>
        <Grid item xs={12}>
          <Typography variant={{ xs: 'body1', sm: 'subtitle1' }} fontWeight={600}>
            Present Address
          </Typography>
        </Grid>
        <Grid item xs={12} sm="auto">
          <TextField {...textFieldProps} label="Village" name="present_village"
            value={form.present_village} onChange={handleChange}
            error={!!errors.present_village} helperText={errors.present_village} />
        </Grid>
        <Grid item xs={12} sm="auto">
          <TextField {...textFieldProps} label="Road/Area" name="present_road"
            value={form.present_road} onChange={handleChange} />
        </Grid>
        <Grid item xs={12} sm="auto">
          <TextField {...textFieldProps} label="Post Office" name="present_po"
            value={form.present_po} onChange={handleChange}
            error={!!errors.present_po} helperText={errors.present_po} />
        </Grid>
        <Grid item xs={12} sm="auto">
          <TextField {...selectFieldProps} select label="Division" name="present_division"
            value={presentDivisionId}
            onChange={(e) => {
              const id = e.target.value;
              setPresentDivisionId(id);
              setPresentDistrictId('');
              setPresentUpazilaId('');
              const div = divisions.find((d) => String(d.id) === id);
              setForm((p) => ({ ...p, present_division: div ? div.name : '', present_district: '', present_upazila: '' }));
            }}
            error={!!errors.present_division}
            helperText={errors.present_division}
            sx={{ ...selectFieldProps.sx, minWidth: 200 }}
          >
            <MenuItem value=""><em>Select Division</em></MenuItem>
            {divisions.map((d) => <MenuItem key={d.id} value={String(d.id)}>{d.name}</MenuItem>)}
          </TextField>
        </Grid>
        <Grid item xs={12} sm="auto">
          <TextField {...selectFieldProps} select label="District" name="present_district"
            value={presentDistrictId}
            onChange={(e) => {
              const id = e.target.value;
              setPresentDistrictId(id);
              setPresentUpazilaId('');
              const dist = districts.find((d) => String(d.id) === id);
              setForm((p) => ({ ...p, present_district: dist ? dist.name : '', present_upazila: '' }));
            }}
            error={!!errors.present_district}
            helperText={errors.present_district}
            sx={{ ...selectFieldProps.sx, minWidth: 200 }}
            disabled={!presentDivisionId}
          >
            <MenuItem value=""><em>Select District</em></MenuItem>
            {districts.map((d) => <MenuItem key={d.id} value={String(d.id)}>{d.name}</MenuItem>)}
          </TextField>
        </Grid>
        <Grid item xs={12} sm="auto">
          <TextField {...selectFieldProps} select label="Upazila" name="present_upazila"
            value={presentUpazilaId}
            onChange={(e) => {
              const id = e.target.value;
              setPresentUpazilaId(id);
              const u = upazilas.find((u) => String(u.id) === id);
              setForm((p) => ({ ...p, present_upazila: u ? u.name : '' }));
            }}
            error={!!errors.present_upazila}
            helperText={errors.present_upazila}
            sx={{ ...selectFieldProps.sx, minWidth: 200 }}
            disabled={!presentDistrictId}
          >
            <MenuItem value=""><em>Select Upazila</em></MenuItem>
            {upazilas.map((u) => <MenuItem key={u.id} value={String(u.id)}>{u.name}</MenuItem>)}
          </TextField>
        </Grid>
        <Grid item xs={12}>
          <Divider sx={{ my: 0.5 }} />
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            spacing={{ xs: 0.5, sm: 0 }}
          >
            <Typography variant={{ xs: 'body1', sm: 'subtitle1' }} fontWeight={600}>
              Permanent Address
            </Typography>
            <FormControlLabel
              control={
                <Checkbox
                  checked={sameAddress}
                  onChange={(e) => setSameAddress(e.target.checked)}
                  size="small"
                />
              }
              label={<Typography variant="body2">Same as Present</Typography>}
              sx={{ m: 0 }}
            />
          </Stack>
        </Grid>
        <Grid item xs={12} sm="auto">
          <TextField {...textFieldProps} label="Village" name="perm_village"
            value={form.perm_village} onChange={handleChange}
            error={!!errors.perm_village} helperText={errors.perm_village} />
        </Grid>
        <Grid item xs={12} sm="auto">
          <TextField {...textFieldProps} label="Road/Area" name="perm_road"
            value={form.perm_road} onChange={handleChange} />
        </Grid>
        <Grid item xs={12} sm="auto">
          <TextField {...textFieldProps} label="Post Office" name="perm_po"
            value={form.perm_po} onChange={handleChange}
            error={!!errors.perm_po} helperText={errors.perm_po} />
        </Grid>
        <Grid item xs={12} sm="auto">
          <TextField {...selectFieldProps} select label="Division" name="perm_division"
            value={permDivisionId}
            onChange={(e) => {
              const id = e.target.value;
              setPermDivisionId(id);
              setPermDistrictId('');
              setPermUpazilaId('');
              const div = divisions.find((d) => String(d.id) === id);
              setForm((p) => ({ ...p, perm_division: div ? div.name : '', perm_district: '', perm_upazila: '' }));
            }}
            error={!!errors.perm_division}
            helperText={errors.perm_division}
            sx={{ ...selectFieldProps.sx, minWidth: 200 }}
          >
            <MenuItem value=""><em>Select Division</em></MenuItem>
            {divisions.map((d) => <MenuItem key={d.id} value={String(d.id)}>{d.name}</MenuItem>)}
          </TextField>
        </Grid>
        <Grid item xs={12} sm="auto">
          <TextField {...selectFieldProps} select label="District" name="perm_district"
            value={permDistrictId}
            onChange={(e) => {
              const id = e.target.value;
              setPermDistrictId(id);
              setPermUpazilaId('');
              const dist = permDistricts.find((d) => String(d.id) === id);
              setForm((p) => ({ ...p, perm_district: dist ? dist.name : '', perm_upazila: '' }));
            }}
            error={!!errors.perm_district}
            helperText={errors.perm_district}
            sx={{ ...selectFieldProps.sx, minWidth: 200 }}
            disabled={!permDivisionId}
          >
            <MenuItem value=""><em>Select District</em></MenuItem>
            {permDistricts.map((d) => <MenuItem key={d.id} value={String(d.id)}>{d.name}</MenuItem>)}
          </TextField>
        </Grid>
        <Grid item xs={12} sm="auto">
          <TextField {...selectFieldProps} select label="Upazila" name="perm_upazila"
            value={permUpazilaId}
            onChange={(e) => {
              const id = e.target.value;
              setPermUpazilaId(id);
              const u = permUpazilas.find((u) => String(u.id) === id);
              setForm((p) => ({ ...p, perm_upazila: u ? u.name : '' }));
            }}
            error={!!errors.perm_upazila}
            helperText={errors.perm_upazila}
            sx={{ ...selectFieldProps.sx, minWidth: 200 }}
            disabled={!permDistrictId}
          >
            <MenuItem value=""><em>Select Upazila</em></MenuItem>
            {permUpazilas.map((u) => <MenuItem key={u.id} value={String(u.id)}>{u.name}</MenuItem>)}
          </TextField>
        </Grid>
        <Grid item xs={12}><Divider sx={{ my: 0.5 }} /></Grid>
        <Grid item xs={12}>
          <Typography variant={{ xs: 'body1', sm: 'subtitle1' }} fontWeight={600} gutterBottom>
            Educational Qualification
          </Typography>
        </Grid>
        <Grid item xs={12} sm="auto">
          <TextField {...textFieldProps} label="Highest Degree" name="edu_degree"
            value={form.edu_degree} onChange={handleChange}
            error={!!errors.edu_degree} helperText={errors.edu_degree} />
        </Grid>
        <Grid item xs={12} sm="auto">
          <TextField {...textFieldProps} label="Institute" name="edu_institute"
            value={form.edu_institute} onChange={handleChange}
            error={!!errors.edu_institute} helperText={errors.edu_institute} />
        </Grid>
        <Grid item xs={12} sm="auto">
          <TextField {...textFieldProps} label="Passing Year" name="edu_year" type="number"
            value={form.edu_year} onChange={handleChange}
            error={!!errors.edu_year} helperText={errors.edu_year} />
        </Grid>
        <Grid item xs={12} sm="auto">
          <TextField {...textFieldProps} label="CGPA/Grade" name="edu_cgpa"
            value={form.edu_cgpa} onChange={handleChange}
            error={!!errors.edu_cgpa} helperText={errors.edu_cgpa} />
        </Grid>
        <Grid item xs={12} sm="auto">
          <TextField {...textFieldProps} label="Institute Address" name="edu_address"
            value={form.edu_address} onChange={handleChange}
            error={!!errors.edu_address} helperText={errors.edu_address} />
        </Grid>
      </Grid>
    </motion.div>
  );

  const renderDocumentsStep = () => (
    <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
      <Typography variant={{ xs: 'body1', sm: 'subtitle1' }} fontWeight={600} gutterBottom>
        Upload Documents
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: { xs: 2, sm: 3 } }}>
        Upload your recent photograph, signature, and NID document.
      </Typography>
      <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: { xs: 3, sm: 4 } }}>
        <Grid item xs={12} sm={6} md={4}>
          {renderFileUpload('photo')}
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          {renderFileUpload('sig')}
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          {renderFileUpload('nid')}
        </Grid>
      </Grid>
      <Divider sx={{ mb: { xs: 2, sm: 3 } }} />
      <FormControlLabel
        control={
          <Checkbox
            checked={form.declaration}
            onChange={handleChange}
            name="declaration"
            color="primary"
          />
        }
        label={
          <Typography variant="body2">
            I hereby declare that all the information provided above is true and correct to the best of my knowledge.
            I understand that any false information may result in the cancellation of my application.
          </Typography>
        }
        sx={{ alignItems: 'flex-start', '& .MuiFormControlLabel-label': { mt: 0.5 } }}
      />
      {apiError && !apiError.includes('already') && (
        <Alert severity="error" sx={{ mt: 2 }}>{apiError}</Alert>
      )}
    </motion.div>
  );

  if (submitted) {
    return (
      <Box sx={{ maxWidth: { xs: '100%', sm: 560 }, mx: 'auto', py: { xs: 4, sm: 8 }, px: { xs: 2, sm: 3 } }}>
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, p: { xs: 3, sm: 5 }, textAlign: 'center' }}>
            <Avatar sx={{ width: { xs: 56, sm: 64 }, height: { xs: 56, sm: 64 }, bgcolor: 'success.main', mx: 'auto', mb: 2 }}>
              <CheckCircle sx={{ fontSize: { xs: 28, sm: 32 } }} />
            </Avatar>
            <Typography variant={{ xs: 'h6', sm: 'h5' }} fontWeight={700} gutterBottom>
              Registration Successful!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Your application has been submitted. Please note your reference number:
            </Typography>
            <Paper variant="outlined" sx={{ py: 2, px: 4, mb: 3, display: 'inline-block', borderRadius: 2 }}>
              <Typography variant={{ xs: 'h5', sm: 'h4' }} fontWeight={700} color="primary" sx={{ letterSpacing: 2 }}>
                {refNo}
              </Typography>
            </Paper>
            <Typography variant="body2" color="text.secondary">
              Keep this reference number for future correspondence.
              You will be notified once your application is reviewed.
            </Typography>
          </Paper>
        </motion.div>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 860, mx: 'auto', py: { xs: 2, sm: 4 }, px: { xs: 1.5, sm: 2, md: 3 } }}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={{ xs: 1, sm: 2 }}
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          sx={{ mb: { xs: 2, sm: 3 } }}
        >
          {isSmUp && (
            <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48, display: { xs: 'none', sm: 'flex' } }}>
              <HowToReg />
            </Avatar>
          )}
          <Box sx={{ flex: 1 }}>
            <Typography variant={{ xs: 'h6', sm: 'h5' }} fontWeight={700}>
              Application Form
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Fill out the form below to apply for admission
            </Typography>
          </Box>
          <Tooltip title="Reset Form">
            <IconButton color="error" onClick={() => setResetDialog(true)} sx={{ alignSelf: { xs: 'flex-end', sm: 'center' } }}>
              <RestartAlt />
            </IconButton>
          </Tooltip>
        </Stack>

        {isMdUp ? (
          <Box
            sx={{
              display: 'flex', justifyContent: 'space-between', mb: 3, px: 1,
              '& .MuiStep-root': { flex: 1, textAlign: 'center', position: 'relative' },
            }}
          >
            {steps.map((label, i) => {
              const completed = i < activeStep;
              const active = i === activeStep;
              const bg = completed ? 'success.main' : active ? 'primary.main' : 'grey.300';
              return (
                <Box key={label} sx={{ flex: 1, textAlign: 'center', position: 'relative' }}>
                  {i > 0 && (
                    <Box
                      sx={{
                        position: 'absolute', top: 18, left: 0, right: '50%',
                        height: 2, bgcolor: i <= activeStep ? 'primary.main' : 'grey.300',
                      }}
                    />
                  )}
                  <Avatar sx={{ width: 36, height: 36, bgcolor: bg, mx: 'auto', mb: 0.5, position: 'relative', zIndex: 1 }}>
                    {stepIcons[i]}
                  </Avatar>
                  <Typography variant="caption" fontWeight={active ? 600 : 400} color={active ? 'text.primary' : 'text.secondary'}>
                    {label}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        ) : (
          <MobileStepDots active={activeStep} count={steps.length} />
        )}

        <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: { xs: 2, sm: 3 }, p: { xs: 2, sm: 3 }, mb: { xs: 2, sm: 3 }, overflowX: 'hidden' }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            spacing={0.5}
            sx={{ mb: 1.5 }}
          >
            <Typography variant="caption" color="text.secondary" sx={{ wordBreak: 'break-word' }}>
              Step {activeStep + 1} of {steps.length} &middot; {steps[activeStep]}
            </Typography>
            <Typography variant="caption" color="primary" sx={{ whiteSpace: 'nowrap' }}>
              {completions}% complete
            </Typography>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={((activeStep + 1) / steps.length) * 100}
            sx={{ borderRadius: 1, height: { xs: 4, sm: 6 }, mb: { xs: 2, sm: 3 } }}
          />

          {apiError && activeStep === 3 && (
            <Alert severity="error" sx={{ mb: 2 }}>{apiError}</Alert>
          )}

          {activeStep === 0 && renderCourseStep()}
          {activeStep === 1 && renderContactStep()}
          {activeStep === 2 && renderAddressStep()}
          {activeStep === 3 && renderDocumentsStep()}
        </Paper>

        <Stack
          direction={{ xs: 'column-reverse', sm: 'row' }}
          justifyContent="space-between"
          spacing={{ xs: 1, sm: 0 }}
        >
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            startIcon={<ArrowBack />}
            variant="outlined"
            fullWidth={!isSmUp}
            sx={{ order: { xs: 0, sm: 0 } }}
          >
            Back
          </Button>
          {activeStep < 3 ? (
            <Button
              onClick={handleNext}
              endIcon={<ArrowForward />}
              variant="contained"
              fullWidth={!isSmUp}
              sx={{ order: { xs: 1, sm: 1 } }}
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              variant="contained"
              disabled={submitting || !form.declaration}
              fullWidth={!isSmUp}
              startIcon={submitting ? undefined : <HowToReg />}
              sx={{ order: { xs: 1, sm: 1 } }}
            >
              {submitting ? 'Submitting...' : 'Submit Application'}
            </Button>
          )}
        </Stack>
      </motion.div>

      <Dialog
        open={resetDialog}
        onClose={() => setResetDialog(false)}
        fullWidth
        maxWidth="xs"
        PaperProps={{ sx: { m: { xs: 2, sm: 3 } } }}
      >
        <DialogTitle>Reset Form</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to reset the form? All filled data will be lost.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: { xs: 1.5, sm: 2 } }}>
          <Button onClick={() => setResetDialog(false)} fullWidth={!isSmUp}>Cancel</Button>
          <Button onClick={handleReset} color="error" variant="contained" fullWidth={!isSmUp}>Reset</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={cropOpen}
        onClose={() => { URL.revokeObjectURL(cropSrc); setCropOpen(false); }}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { m: { xs: 1, sm: 2 } } }}
      >
        <DialogTitle>
          Crop {cropType === 'photo' ? 'Photograph' : 'Signature'}
          <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
            Aspect ratio: {cropType === 'photo' ? '1:1 (Square)' : '3:1 (Wide)'}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', justifyContent: 'center', bgcolor: '#f5f5f5' }}>
          {cropSrc && (
            <ReactCrop
              crop={crop}
              onChange={(c) => setCrop(c)}
              aspect={cropType === 'photo' ? 1 : 3}
              minWidth={50}
              minHeight={50}
            >
              <img
                ref={imgRef}
                src={cropSrc}
                style={{ maxWidth: '100%', maxHeight: '65vh', objectFit: 'contain' }}
                alt="Crop preview"
              />
            </ReactCrop>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={() => { URL.revokeObjectURL(cropSrc); setCropOpen(false); }}
            fullWidth={!isSmUp}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCropConfirm}
            variant="contained"
            disabled={!crop}
            fullWidth={!isSmUp}
          >
            Crop & Upload
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
