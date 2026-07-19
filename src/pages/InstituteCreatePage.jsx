import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Paper, Typography, TextField, Button, Stack, Autocomplete, Divider } from '@mui/material';
import { useCreateInstitute } from '@/hooks/useInstitutes';
import { useDivisions, useDistricts, useUpazilas } from '@/hooks/useBdAddress';

export default function InstituteCreatePage() {
  const navigate = useNavigate();
  const createMutation = useCreateInstitute();
  const { data: divisions = [] } = useDivisions();
  const [form, setForm] = useState({
    name: '', name_bn: '', address: '', country: 'Bangladesh', division_id: '',
    district_id: '', upazila_id: '', contact_no: '', stp_code: '', email: '', ref_prefix: '',
    admin_name: '', admin_email: '', admin_password: '',
  });
  const [errors, setErrors] = useState({});

  const { data: districts = [] } = useDistricts(form.division_id || null);
  const { data: upazilas = [] } = useUpazilas(form.district_id || null);

  const selectedDivision = divisions.find((d) => String(d.id) === form.division_id) || null;
  const selectedDistrict = districts.find((d) => String(d.id) === form.district_id) || null;
  const selectedUpazila = upazilas.find((u) => String(u.id) === form.upazila_id) || null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.name.trim()) errs.name = 'Institute name is required';
    if (!form.admin_name.trim()) errs.admin_name = 'Admin name is required';
    if (!form.admin_email.trim()) errs.admin_email = 'Admin email is required';
    else if (!/\S+@\S+\.\S+/.test(form.admin_email)) errs.admin_email = 'Invalid email';
    if (!form.admin_password || form.admin_password.length < 6) errs.admin_password = 'Password must be at least 6 characters';
    setErrors(errs);
    if (Object.keys(errs).length) return;

    const payload = {
      ...form,
      division: form.division_id,
      district: form.district_id,
      upazila: form.upazila_id,
    };
    createMutation.mutate(payload, { onSuccess: () => navigate('/institutes') });
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} mb={3}>Create Institute</Typography>
      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, p: 3, maxWidth: 700 }}>
        <Stack component="form" onSubmit={handleSubmit} spacing={3}>
          <Typography variant="subtitle1" fontWeight={600}>Institute Details</Typography>
          <TextField label="Institute Name (EN)" required value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} error={!!errors.name} helperText={errors.name} />
          <TextField label="Institute Name (BN)" value={form.name_bn} onChange={(e) => setForm((p) => ({ ...p, name_bn: e.target.value }))} />
          <TextField label="Address" multiline rows={2} value={form.address} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} />
          <Stack direction="row" spacing={2}>
            <TextField label="Country" value={form.country} onChange={(e) => setForm((p) => ({ ...p, country: e.target.value }))} sx={{ flex: 1 }} />
            <Autocomplete
              options={divisions}
              getOptionLabel={(o) => o.name || ''}
              value={selectedDivision}
              onChange={(_, v) => setForm((p) => ({ ...p, division_id: v ? String(v.id) : '', district_id: '', upazila_id: '' }))}
              isOptionEqualToValue={(o, v) => String(o.id) === String(v.id)}
              renderInput={(params) => <TextField {...params} label="Division" />}
              sx={{ flex: 1 }}
            />
          </Stack>
          <Stack direction="row" spacing={2}>
            <Autocomplete
              options={districts}
              getOptionLabel={(o) => o.name || ''}
              value={selectedDistrict}
              onChange={(_, v) => setForm((p) => ({ ...p, district_id: v ? String(v.id) : '', upazila_id: '' }))}
              isOptionEqualToValue={(o, v) => String(o.id) === String(v.id)}
              renderInput={(params) => <TextField {...params} label="District" />}
              sx={{ flex: 1 }}
              disabled={!form.division_id}
            />
            <Autocomplete
              options={upazilas}
              getOptionLabel={(o) => o.name || ''}
              value={selectedUpazila}
              onChange={(_, v) => setForm((p) => ({ ...p, upazila_id: v ? String(v.id) : '' }))}
              isOptionEqualToValue={(o, v) => String(o.id) === String(v.id)}
              renderInput={(params) => <TextField {...params} label="Upazila" />}
              sx={{ flex: 1 }}
              disabled={!form.district_id}
            />
          </Stack>
          <Stack direction="row" spacing={2}>
            <TextField label="Contact No" value={form.contact_no} onChange={(e) => setForm((p) => ({ ...p, contact_no: e.target.value }))} sx={{ flex: 1 }} />
            <TextField label="STP Code" value={form.stp_code} onChange={(e) => setForm((p) => ({ ...p, stp_code: e.target.value }))} sx={{ flex: 1 }} />
          </Stack>
          <Stack direction="row" spacing={2}>
            <TextField label="Email" type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} sx={{ flex: 1 }} />
            <TextField label="Ref Prefix" value={form.ref_prefix} onChange={(e) => setForm((p) => ({ ...p, ref_prefix: e.target.value }))} sx={{ flex: 1 }} />
          </Stack>

          <Divider />
          <Typography variant="subtitle1" fontWeight={600}>Admin Account</Typography>
          <TextField label="Admin Name" required value={form.admin_name} onChange={(e) => setForm((p) => ({ ...p, admin_name: e.target.value }))} error={!!errors.admin_name} helperText={errors.admin_name} />
          <TextField label="Admin Email" type="email" required value={form.admin_email} onChange={(e) => setForm((p) => ({ ...p, admin_email: e.target.value }))} error={!!errors.admin_email} helperText={errors.admin_email} />
          <TextField label="Admin Password" type="password" required value={form.admin_password} onChange={(e) => setForm((p) => ({ ...p, admin_password: e.target.value }))} error={!!errors.admin_password} helperText={errors.admin_password} />

          <Stack direction="row" spacing={2}>
            <Button variant="contained" type="submit" disabled={createMutation.isPending}>Create</Button>
            <Button variant="outlined" onClick={() => navigate('/institutes')}>Cancel</Button>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
}
