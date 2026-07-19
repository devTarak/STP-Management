import { useState } from 'react';
import { Grid, Paper, Typography, Box, Stack, Chip, Skeleton, Pagination } from '@mui/material';
import { useInstitutes } from '@/hooks/useInstitutes';
import SchoolIcon from '@mui/icons-material/School';
import GroupsIcon from '@mui/icons-material/Groups';
import PeopleIcon from '@mui/icons-material/People';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

function StatBox({ icon: Icon, label, value, color }) {
  return (
    <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
      <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: `${color}.lighter`, color: `${color}.main`, display: 'flex' }}>
        <Icon />
      </Box>
      <Box>
        <Typography variant="body2" color="text.secondary">{label}</Typography>
        <Typography variant="h5" fontWeight={700}>{value ?? 0}</Typography>
      </Box>
    </Paper>
  );
}

export default function InstituteOverviewPage() {
  const [page, setPage] = useState(1);
  const perPage = 4;
  const { data: institutesData, isLoading } = useInstitutes({ page, per_page: perPage });
  const institutes = institutesData?.items ?? [];
  const total = institutesData?.total ?? 0;
  const lastPage = institutesData?.last_page ?? 1;

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><Skeleton variant="rectangular" height={200} /></Box>;

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} mb={3}>Institute Overview</Typography>
      <Grid container spacing={3}>
        {institutes.length === 0 ? (
          <Grid item xs={12}>
            <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, p: 6, textAlign: 'center' }}>
              <Typography color="text.secondary">No institutes found.</Typography>
            </Paper>
          </Grid>
        ) : institutes.map((inst) => (
          <Grid item xs={12} md={6} key={inst.id}>
            <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, p: 3 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Box>
                  <Typography variant="h6" fontWeight={600}>{inst.name}</Typography>
                  {inst.name_bn && <Typography variant="body2" color="text.secondary">{inst.name_bn}</Typography>}
                </Box>
                <Chip label={inst.status} color={inst.status === 'active' ? 'success' : 'default'} size="small" />
              </Stack>
              <Typography variant="body2" color="text.secondary" mb={2}>
                {inst.address ? `${inst.address}, ` : ''}{inst.upazila_name ? `${inst.upazila_name}, ` : ''}{inst.district_name || ''}
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" mb={2}>
                {inst.stp_code && <Chip label={`STP: ${inst.stp_code}`} size="small" variant="outlined" />}
                {inst.email && <Chip label={inst.email} size="small" variant="outlined" />}
                {inst.contact_no && <Chip label={inst.contact_no} size="small" variant="outlined" />}
                {inst.ref_prefix && <Chip label={`Ref: ${inst.ref_prefix}`} size="small" variant="outlined" />}
              </Stack>
              <Grid container spacing={2}>
                <Grid item xs={3}><StatBox icon={SchoolIcon} label="Courses" value={inst.course_count} color="primary" /></Grid>
                <Grid item xs={3}><StatBox icon={GroupsIcon} label="Batches" value={inst.batch_count} color="success" /></Grid>
                <Grid item xs={3}><StatBox icon={PeopleIcon} label="Students" value={inst.student_count} color="info" /></Grid>
                <Grid item xs={3}><StatBox icon={AdminPanelSettingsIcon} label="Admins" value={inst.admin_count} color="warning" /></Grid>
              </Grid>
            </Paper>
          </Grid>
        ))}
      </Grid>
      {total > perPage && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination count={lastPage} page={page} onChange={(_, p) => setPage(p)} color="primary" />
        </Box>
      )}
    </Box>
  );
}
