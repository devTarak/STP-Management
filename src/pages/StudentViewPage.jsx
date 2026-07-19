import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Paper, Typography, Grid, Stack, Chip, Button, Avatar,
  Divider, Skeleton, Table, TableBody, TableCell,
  TableContainer, TableRow, Dialog, DialogTitle, DialogContent,
  DialogContentText, DialogActions, IconButton, Tooltip, CircularProgress,
} from '@mui/material';
import {
  ArrowBack, Edit, Delete, CheckCircle, Cancel,
  Image as ImageIcon, Close, CloudDownload, Print, Badge,
} from '@mui/icons-material';
import { useStudent, useDeleteStudent, useUpdateStudentStatus } from '@/hooks/useStudents';
import RejectDialog from '@/components/common/RejectDialog';
import IdCard from '@/components/common/IdCard';
import { useAuth } from '@/hooks/useAuth';
import { formatDate, formatDateTime, getStatusColor } from '@/utils/helpers';
import api from '@/config/api';
import { motion } from 'framer-motion';
import { toPng } from 'html-to-image';
import toast from 'react-hot-toast';

function DetailRow({ label, value }) {
  return (
    <TableRow>
      <TableCell sx={{ color: 'text.secondary', fontWeight: 500, width: 200, borderBottom: 'none', py: 1 }}>
        {label}
      </TableCell>
      <TableCell sx={{ borderBottom: 'none', py: 1 }}>
        {value || '-'}
      </TableCell>
    </TableRow>
  );
}

function DocumentCard({ label, url, onPreview, downloads }) {
  const items = downloads && downloads.length ? downloads : (url ? [{ label: 'Download', url }] : []);
  return (
    <Paper
      variant="outlined"
      onClick={() => url && onPreview()}
      sx={{
        p: 2, borderRadius: 2, textAlign: 'center',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1,
        cursor: url ? 'pointer' : 'default',
        '&:hover': url ? { borderColor: 'primary.main', bgcolor: 'action.hover' } : {},
      }}
    >
      <Avatar variant="rounded" sx={{ width: 48, height: 48, bgcolor: 'action.hover' }}>
        <ImageIcon color="action" />
      </Avatar>
      <Typography variant="body2" fontWeight={500}>{label}</Typography>
      {items.length > 0 ? (
        <Stack direction="row" spacing={0.5}>
          {items.map((item, i) => (
            <Tooltip key={i} title={`Download ${item.label}`}>
              <IconButton size="small" component="a" href={item.url} download onClick={(e) => e.stopPropagation()}>
                <CloudDownload fontSize="small" />
              </IconButton>
            </Tooltip>
          ))}
        </Stack>
      ) : (
        <Typography variant="caption" color="text.secondary">Not uploaded</Typography>
      )}
    </Paper>
  );
}

function downloadUrl(url) {
  if (!url) return url;
  const token = localStorage.getItem('auth_token');
  const sep = url.includes('?') ? '&' : '?';
  let result = url;
  if (token) result = `${result}${sep}token=${encodeURIComponent(token)}`;
  const sep2 = result.includes('?') ? '&' : '?';
  result = `${result}${sep2}download=1`;
  return result;
}

export default function StudentViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: student, isLoading } = useStudent(id);
  const deleteMutation = useDeleteStudent();
  const statusMutation = useUpdateStudentStatus();
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [rejectDialog, setRejectDialog] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewKey, setPreviewKey] = useState(0);
  const [blobUrl, setBlobUrl] = useState(null);
  const [isImage, setIsImage] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [idCardLoading, setIdCardLoading] = useState(false);
  const [cardData, setCardData] = useState(null);
  const idCardRef = useRef(null);

  const handleDownloadIdCard = async () => {
    setIdCardLoading(true);
    try {
      let photoDataUrl = null;
      if (student.photo_url) {
        try {
          const res = await api.get(`students/${id}/documents/photo`, { responseType: 'blob' });
          photoDataUrl = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.readAsDataURL(res.data);
          });
        } catch {
          photoDataUrl = null;
        }
      }
      let stampDataUrl = null;
      if (student.institute_stamp) {
        try {
          const res = await api.get(`institutes/${student.institute_id}/documents/stamp`, { responseType: 'blob' });
          stampDataUrl = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.readAsDataURL(res.data);
          });
        } catch {
          stampDataUrl = null;
        }
      }
      setCardData({ ...student, photo_data_url: photoDataUrl, stamp_data_url: stampDataUrl });
      await new Promise((r) => setTimeout(r, 150));
      if (!idCardRef.current) {
        setIdCardLoading(false);
        setCardData(null);
        return;
      }
      const dataUrl = await toPng(idCardRef.current, { quality: 1, pixelRatio: 2, cacheBust: true });
      const link = document.createElement('a');
      link.download = `ID_Card_${student.ref_no || student.id}.png`;
      link.href = dataUrl;
      link.click();
    } catch {
      toast.error('Failed to generate ID card.');
    } finally {
      setIdCardLoading(false);
      setCardData(null);
    }
  };

  const openPreview = (url) => {
    if (blobUrl) URL.revokeObjectURL(blobUrl);
    setBlobUrl(null);
    setPreviewUrl(url);
    setPreviewKey((k) => k + 1);
  };

  const closePreview = () => {
    if (blobUrl) URL.revokeObjectURL(blobUrl);
    setBlobUrl(null);
    setPreviewUrl(null);
  };

  useEffect(() => {
    if (!previewUrl) return;
    let cancelled = false;
    setPreviewLoading(true);
    api.get(previewUrl, { responseType: 'blob' }).then((res) => {
      if (!cancelled) {
        const mime = res.headers['content-type'] || '';
        setBlobUrl(URL.createObjectURL(res.data));
        setIsImage(mime.startsWith('image/'));
        setPreviewLoading(false);
      }
    }).catch(() => {
      if (!cancelled) setPreviewLoading(false);
    });
    return () => { cancelled = true; };
  }, [previewUrl, previewKey]);

  if (isLoading) {
    return (
      <Box>
        <Skeleton variant="text" width={300} height={40} sx={{ mb: 2 }} />
        <Skeleton variant="rounded" width="100%" height={300} />
      </Box>
    );
  }

  if (!student) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6" color="text.secondary">Student not found.</Typography>
        <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)} sx={{ mt: 2 }}>
          Back
        </Button>
      </Box>
    );
  }

  const handleDelete = () => {
    deleteMutation.mutate(id, {
      onSuccess: () => navigate('/students'),
    });
    setDeleteDialog(false);
  };

  const handleStatus = (status) => {
    if (status === 'rejected') {
      setRejectDialog(true);
      return;
    }
    statusMutation.mutate({ id, data: { status } });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <IconButton onClick={() => navigate(-1)}><ArrowBack /></IconButton>
          <Box>
            <Typography variant="h5" fontWeight={700}>{student.name_en || 'Student'}</Typography>
            <Typography variant="body2" color="text.secondary">
              Ref: {student.ref_no || '-'} &middot; {student.name_bn || ''}
            </Typography>
          </Box>
        </Stack>
        <Stack direction="row" spacing={1}>
          {student.status !== 'approved' && (
            <Button
              variant="contained"
              color="success"
              startIcon={<CheckCircle />}
              onClick={() => handleStatus('approved')}
              disabled={statusMutation.isPending}
            >
              Approve
            </Button>
          )}
          {student.status !== 'rejected' && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<Cancel />}
              onClick={() => handleStatus('rejected')}
              disabled={statusMutation.isPending}
            >
              Reject
            </Button>
          )}
          <Button
            variant="outlined"
            startIcon={<Print />}
            onClick={() => { const token = localStorage.getItem('auth_token'); window.open(`/api/students/${id}/print?token=${token}`, '_blank'); }}
          >
            Print
          </Button>
          {student.status === 'approved' && (
            <Button
              variant="contained"
              color="secondary"
              startIcon={<Badge />}
              onClick={handleDownloadIdCard}
              disabled={idCardLoading}
            >
              {idCardLoading ? 'Generating...' : 'Download ID Card'}
            </Button>
          )}
          <Button
            variant="outlined"
            startIcon={<Edit />}
            onClick={() => navigate(`/students/${id}/edit`)}
          >
            Edit
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<Delete />}
            onClick={() => setDeleteDialog(true)}
            disabled={student.status !== 'pending'}
          >
            Delete
          </Button>
        </Stack>
      </Stack>

      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, mb: 3, overflow: 'hidden' }}>
        <Box sx={{ px: 3, pt: 3, pb: 2, bgcolor: 'grey.50' }}>
          <Stack direction="row" spacing={3} alignItems="center">
            <Avatar
              src={student.photo_url}
              sx={{ width: 72, height: 72, bgcolor: 'primary.light', fontSize: 28 }}
            >
              {student.name_en?.charAt(0)?.toUpperCase()}
            </Avatar>
            <Box>
              <Chip
                label={student.status ? student.status.charAt(0).toUpperCase() + student.status.slice(1) : '-'}
                color={getStatusColor(student.status)}
                size="small"
                sx={{ mb: 1 }}
              />
              <Typography variant="h6" fontWeight={600}>{student.name_en}</Typography>
              <Typography variant="body2" color="text.secondary">
                {student.email} | {student.contact_no}
              </Typography>
            </Box>
          </Stack>
        </Box>
      </Paper>

      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, mb: 3 }}>
        <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: '12px 12px 0 0' }}>
          <Typography fontWeight={600}>Personal Information</Typography>
        </Box>
        <Divider />
        <TableContainer>
          <Table size="small">
            <TableBody>
              <DetailRow label="Ref No" value={student.ref_no} />
              <DetailRow label="Name (English)" value={student.name_en} />
              <DetailRow label="Name (Bangla)" value={student.name_bn} />
              <DetailRow label="Father's Name (English)" value={student.father_name_en} />
              <DetailRow label="Father's Name (Bangla)" value={student.father_name_bn} />
              <DetailRow label="Mother's Name (English)" value={student.mother_name_en} />
              <DetailRow label="Mother's Name (Bangla)" value={student.mother_name_bn} />
              <DetailRow label="Contact No" value={student.contact_no} />
              <DetailRow label="Email" value={student.email} />
              <DetailRow label="Date of Birth" value={formatDate(student.date_of_birth)} />
              <DetailRow label="Gender" value={student.gender} />
              <DetailRow label="Religion" value={student.religion} />
              <DetailRow label="Nationality" value={student.nationality} />
              <DetailRow label="Blood Group" value={student.blood_group} />
              <DetailRow label="Occupation" value={student.occupation} />
              <DetailRow label="ID Type" value={student.id_type} />
              <DetailRow label="ID Number" value={student.id_number} />
              <DetailRow label="Guardian Contact" value={student.guardian_contact} />
              <DetailRow label="Guardian Relation" value={student.guardian_relation} />
              <DetailRow label="Course" value={student.course_name} />
              <DetailRow label="Batch" value={student.batch_name} />
              <DetailRow label="Status" value={student.status} />
              <DetailRow label="Created At" value={formatDateTime(student.created_at)} />
              <DetailRow label="Updated At" value={formatDateTime(student.updated_at)} />
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, height: '100%' }}>
            <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: '12px 12px 0 0' }}>
              <Typography fontWeight={600}>Present Address</Typography>
            </Box>
            <Divider />
            <TableContainer>
              <Table size="small">
                <TableBody>
                  <DetailRow label="Village" value={student.present_village} />
                  <DetailRow label="Road/Area" value={student.present_road} />
                  <DetailRow label="Post Office" value={student.present_po} />
                  <DetailRow label="Upazila" value={student.present_upazila} />
                  <DetailRow label="District" value={student.present_district} />
                  <DetailRow label="Division" value={student.present_division} />
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, height: '100%' }}>
            <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: '12px 12px 0 0' }}>
              <Typography fontWeight={600}>Permanent Address</Typography>
            </Box>
            <Divider />
            <TableContainer>
              <Table size="small">
                <TableBody>
                  <DetailRow label="Village" value={student.perm_village} />
                  <DetailRow label="Road/Area" value={student.perm_road} />
                  <DetailRow label="Post Office" value={student.perm_po} />
                  <DetailRow label="Upazila" value={student.perm_upazila} />
                  <DetailRow label="District" value={student.perm_district} />
                  <DetailRow label="Division" value={student.perm_division} />
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>

      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, mb: 3 }}>
        <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: '12px 12px 0 0' }}>
          <Typography fontWeight={600}>Educational Qualification</Typography>
        </Box>
        <Divider />
        <TableContainer>
          <Table size="small">
            <TableBody>
              <DetailRow label="Degree" value={student.edu_degree} />
              <DetailRow label="Institute" value={student.edu_institute} />
              <DetailRow label="Passing Year" value={student.edu_year} />
              <DetailRow label="CGPA/Grade" value={student.edu_cgpa} />
              <DetailRow label="Institute Address" value={student.edu_address} />
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, mb: 3 }}>
        <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: '12px 12px 0 0' }}>
          <Typography fontWeight={600}>Documents</Typography>
        </Box>
        <Divider />
        <Box sx={{ p: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
              <DocumentCard label="Photo" url={downloadUrl(student.photo_url)} onPreview={() => student.photo_url && setPreviewUrl(`students/${id}/documents/photo`)} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <DocumentCard
                label="Signature"
                url={downloadUrl(student.signature_url)}
                onPreview={() => student.signature_url && setPreviewUrl(`students/${id}/documents/signature`)}
                downloads={student.signature_url ? [
                  { label: '300×80', url: downloadUrl(`${student.signature_url}?h=80`) },
                  { label: '300×100', url: downloadUrl(`${student.signature_url}?h=100`) },
                ] : []}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <DocumentCard label="NID Document" url={downloadUrl(student.nid_url)} onPreview={() => student.nid_url && setPreviewUrl(`students/${id}/documents/nid`)} />
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {student.status === 'rejected' && student.rejection_feedback && (
        <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'error.main', borderRadius: 3, mb: 3, p: 3, bgcolor: 'error.50' }}>
          <Typography fontWeight={600} color="error" gutterBottom>Rejection Feedback</Typography>
          <Typography variant="body2">{student.rejection_feedback}</Typography>
        </Paper>
      )}

      <Dialog open={!!previewUrl} onClose={closePreview} maxWidth="md" fullWidth>
        <DialogTitle>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography>Document Preview</Typography>
            <IconButton onClick={closePreview}><Close /></IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          {previewLoading ? (
            <CircularProgress />
          ) : blobUrl ? (
            isImage ? (
              <Box component="img" src={blobUrl} sx={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain', borderRadius: 1 }} />
            ) : (
              <Box component="iframe" src={blobUrl} sx={{ width: '100%', height: '70vh', border: 'none' }} title="Document Preview" />
            )
          ) : (
            <Typography color="text.secondary">Failed to load document.</Typography>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
        <DialogTitle>Delete Student?</DialogTitle>
        <DialogContent>
          <DialogContentText>This action cannot be undone. Only pending applications can be deleted.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>

      <RejectDialog
        open={rejectDialog}
        onClose={() => setRejectDialog(false)}
        onConfirm={(feedback) => {
          statusMutation.mutate({ id, data: { status: 'rejected', rejection_feedback: feedback } });
          setRejectDialog(false);
        }}
      />

      {/* Hidden ID Card for PNG export - only rendered when downloading */}
      {cardData && (
        <Box sx={{ position: 'absolute', left: -9999, top: 0, opacity: 0, pointerEvents: 'none', zIndex: -1 }}>
          <IdCard ref={idCardRef} student={cardData} />
        </Box>
      )}
    </motion.div>
  );
}

