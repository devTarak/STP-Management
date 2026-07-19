import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Paper, Typography, Grid, Stack, Button, TextField,
  MenuItem, Divider, IconButton, Skeleton, Alert,
} from '@mui/material';
import { ArrowBack, Save } from '@mui/icons-material';
import { useStudent, useUpdateStudent } from '@/hooks/useStudents';
import { motion } from 'framer-motion';
import { getErrorMessage, getFieldErrors } from '@/utils/errorHandler';

const genders = ['Male', 'Female', 'Other'];
const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
const idTypes = ['NID', 'Birth Certificate', 'Passport'];
const bdDivisions = ['Dhaka', 'Chattogram', 'Rajshahi', 'Khulna', 'Barishal', 'Sylhet', 'Rangpur', 'Mymensingh'];

function FormSection({ title, children }) {
  return (
    <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, mb: 3 }}>
      <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: '12px 12px 0 0', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Typography fontWeight={600}>{title}</Typography>
      </Box>
      <Box sx={{ p: 3 }}>
        <Grid container spacing={2.5}>
          {children}
        </Grid>
      </Box>
    </Paper>
  );
}

function FormField({ label, name, value, onChange, error, helperText, required, select, children, ...props }) {
  return (
    <Grid item xs={12} sm={6} md={4}>
      <TextField
        fullWidth
        size="small"
        label={label}
        name={name}
        value={value}
        onChange={onChange}
        error={!!error}
        helperText={error || helperText}
        required={required}
        select={select}
        {...props}
      >
        {select && children}
      </TextField>
    </Grid>
  );
}

export default function StudentEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: student, isLoading } = useStudent(id);
  const updateMutation = useUpdateStudent();
  const [form, setForm] = useState({});
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    if (student) {
      setForm({
        name_en: student.name_en || '',
        name_bn: student.name_bn || '',
        father_name_en: student.father_name_en || '',
        father_name_bn: student.father_name_bn || '',
        mother_name_en: student.mother_name_en || '',
        mother_name_bn: student.mother_name_bn || '',
        contact_no: student.contact_no || '',
        email: student.email || '',
        date_of_birth: student.date_of_birth || '',
        gender: student.gender || '',
        religion: student.religion || '',
        nationality: student.nationality || '',
        id_type: student.id_type || '',
        id_number: student.id_number || '',
        occupation: student.occupation || '',
        blood_group: student.blood_group || '',
        guardian_contact: student.guardian_contact || '',
        guardian_relation: student.guardian_relation || '',
        present_village: student.present_village || '',
        present_road: student.present_road || '',
        present_po: student.present_po || '',
        present_upazila: student.present_upazila || '',
        present_district: student.present_district || '',
        present_division: student.present_division || '',
        perm_village: student.perm_village || '',
        perm_road: student.perm_road || '',
        perm_po: student.perm_po || '',
        perm_upazila: student.perm_upazila || '',
        perm_district: student.perm_district || '',
        perm_division: student.perm_division || '',
        edu_degree: student.edu_degree || '',
        edu_institute: student.edu_institute || '',
        edu_year: student.edu_year || '',
        edu_cgpa: student.edu_cgpa || '',
        edu_address: student.edu_address || '',
      });
    }
  }, [student]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    setErrors({});

    try {
      await updateMutation.mutateAsync({ id, data: form });
      navigate(`/students/${id}`);
    } catch (err) {
      const fieldErrors = getFieldErrors(err);
      if (fieldErrors && typeof fieldErrors === 'object') {
        setErrors(fieldErrors);
      }
      setApiError(getErrorMessage(err));
    }
  };

  if (isLoading) {
    return (
      <Box>
        <Skeleton variant="text" width={300} height={40} sx={{ mb: 2 }} />
        <Skeleton variant="rounded" width="100%" height={400} />
      </Box>
    );
  }

  if (!student) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6" color="text.secondary">Student not found.</Typography>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/students')} sx={{ mt: 2 }}>
          Back to Students
        </Button>
      </Box>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Stack direction="row" alignItems="center" spacing={2} mb={3}>
        <IconButton onClick={() => navigate(`/students/${id}`)}><ArrowBack /></IconButton>
        <Typography variant="h5" fontWeight={700}>Edit Student</Typography>
      </Stack>

      {apiError && <Alert severity="error" sx={{ mb: 3 }}>{apiError}</Alert>}

      <form onSubmit={handleSubmit}>
        <FormSection title="Personal Information">
          <FormField label="Name (English)" name="name_en" value={form.name_en} onChange={handleChange}
            error={errors.name_en} helperText={errors.name_en} />
          <FormField label="Name (Bangla)" name="name_bn" value={form.name_bn} onChange={handleChange} />
          <FormField label="Father's Name (English)" name="father_name_en" value={form.father_name_en} onChange={handleChange} />
          <FormField label="Father's Name (Bangla)" name="father_name_bn" value={form.father_name_bn} onChange={handleChange} />
          <FormField label="Mother's Name (English)" name="mother_name_en" value={form.mother_name_en} onChange={handleChange} />
          <FormField label="Mother's Name (Bangla)" name="mother_name_bn" value={form.mother_name_bn} onChange={handleChange} />
          <FormField label="Contact No" name="contact_no" value={form.contact_no} onChange={handleChange} />
          <FormField label="Email" name="email" type="email" value={form.email} onChange={handleChange}
            error={errors.email} helperText={errors.email} />
          <FormField label="Date of Birth" name="date_of_birth" type="date" value={form.date_of_birth}
            onChange={handleChange} InputLabelProps={{ shrink: true }} />
          <FormField label="Gender" name="gender" value={form.gender} onChange={handleChange} select>
            {genders.map((g) => <MenuItem key={g} value={g}>{g}</MenuItem>)}
          </FormField>
          <FormField label="Religion" name="religion" value={form.religion} onChange={handleChange} />
          <FormField label="Nationality" name="nationality" value={form.nationality} onChange={handleChange} />
          <FormField label="ID Type" name="id_type" value={form.id_type} onChange={handleChange} select>
            {idTypes.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
          </FormField>
          <FormField label="ID Number" name="id_number" value={form.id_number} onChange={handleChange} />
          <FormField label="Occupation" name="occupation" value={form.occupation} onChange={handleChange} />
          <FormField label="Blood Group" name="blood_group" value={form.blood_group} onChange={handleChange} select>
            {bloodGroups.map((b) => <MenuItem key={b} value={b}>{b}</MenuItem>)}
          </FormField>
          <FormField label="Guardian Contact" name="guardian_contact" value={form.guardian_contact} onChange={handleChange} />
          <FormField label="Guardian Relation" name="guardian_relation" value={form.guardian_relation} onChange={handleChange} />
        </FormSection>

        <FormSection title="Present Address">
          <FormField label="Village" name="present_village" value={form.present_village} onChange={handleChange} />
          <FormField label="Road/Area" name="present_road" value={form.present_road} onChange={handleChange} />
          <FormField label="Post Office" name="present_po" value={form.present_po} onChange={handleChange} />
          <FormField label="Upazila" name="present_upazila" value={form.present_upazila} onChange={handleChange} />
          <FormField label="District" name="present_district" value={form.present_district} onChange={handleChange} />
          <FormField label="Division" name="present_division" value={form.present_division} onChange={handleChange} select>
            {bdDivisions.map((d) => <MenuItem key={d} value={d}>{d}</MenuItem>)}
          </FormField>
        </FormSection>

        <FormSection title="Permanent Address">
          <FormField label="Village" name="perm_village" value={form.perm_village} onChange={handleChange} />
          <FormField label="Road/Area" name="perm_road" value={form.perm_road} onChange={handleChange} />
          <FormField label="Post Office" name="perm_po" value={form.perm_po} onChange={handleChange} />
          <FormField label="Upazila" name="perm_upazila" value={form.perm_upazila} onChange={handleChange} />
          <FormField label="District" name="perm_district" value={form.perm_district} onChange={handleChange} />
          <FormField label="Division" name="perm_division" value={form.perm_division} onChange={handleChange} select>
            {bdDivisions.map((d) => <MenuItem key={d} value={d}>{d}</MenuItem>)}
          </FormField>
        </FormSection>

        <FormSection title="Educational Qualification">
          <FormField label="Degree" name="edu_degree" value={form.edu_degree} onChange={handleChange} />
          <FormField label="Institute" name="edu_institute" value={form.edu_institute} onChange={handleChange} />
          <FormField label="Passing Year" name="edu_year" type="number" value={form.edu_year} onChange={handleChange} />
          <FormField label="CGPA/Grade" name="edu_cgpa" value={form.edu_cgpa} onChange={handleChange} />
          <FormField label="Institute Address" name="edu_address" value={form.edu_address} onChange={handleChange}
            sx={{ '& .MuiGrid-item': { md: 6 } }} />
        </FormSection>

        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button variant="outlined" onClick={() => navigate(`/students/${id}`)}>Cancel</Button>
          <Button type="submit" variant="contained" startIcon={<Save />} disabled={updateMutation.isPending}>
            {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </Stack>
      </form>
    </motion.div>
  );
}
