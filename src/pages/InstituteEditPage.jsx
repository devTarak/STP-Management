import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Paper, Typography, TextField, Button, Stack, CircularProgress, Autocomplete } from '@mui/material';
import { useInstitute, useUpdateInstitute } from '@/hooks/useInstitutes';
import { useDivisions, useDistricts, useUpazilas } from '@/hooks/useBdAddress';

export default function InstituteEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: institute, isLoading } = useInstitute(id);
  const updateMutation = useUpdateInstitute();
  const { data: divisions = [] } = useDivisions();
  const [form, setForm] = useState({
    name: '', name_bn: '', address: '', country: '', division_id: '',
    district_id: '', upazila_id: '', contact_no: '', stp_code: '', email: '', ref_prefix: '',
  });
  const [errors, setErrors] = useState({});

  const { data: districts = [] } = useDistricts(form.division_id || null);
  const { data: upazilas = [] } = useUpazilas(form.district_id || null);

  const selectedDivision = divisions.find((d) => String(d.id) === form.division_id) || null;
  const selectedDistrict = districts.find((d) => String(d.id) === form.district_id) || null;
  const selectedUpazila = upazilas.find((u) => String(u.id) === form.upazila_id) || null;

  useEffect(() => {
    if (institute) {
      setForm({
        name: institute.name || '',
        name_bn: institute.name_bn || '',
        address: institute.address || '',
        country: institute.country || '',
        division_id: String(institute.division || ''),
        district_id: String(institute.district || ''),
        upazila_id: String(institute.upazila || ''),
        contact_no: institute.contact_no || '',
        stp_code: institute.stp_code || '',
        email: institute.email || '',
        ref_prefix: institute.ref_prefix || '',
      });
    }
  }, [institute]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.name.trim()) errs.name = 'Institute name is required';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    const payload = {
      name: form.name,
      name_bn: form.name_bn,
      address: form.address,
      country: form.country,
      division: form.division_id,
      district: form.district_id,
      upazila: form.upazila_id,
      contact_no: form.contact_no,
      stp_code: form.stp_code,
      email: form.email,
      ref_prefix: form.ref_prefix,
    };
    updateMutation.mutate({ id: Number(id), data: payload }, { onSuccess: () => navigate('/institutes') });
  };

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} mb={3}>Edit Institute</Typography>
      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, p: 3, maxWidth: 700 }}>
        <Stack component="form" onSubmit={handleSubmit} spacing={3}>
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

          <Stack direction="row" spacing={2}>
            <Button variant="contained" type="submit" disabled={updateMutation.isPending}>Update</Button>
            <Button variant="outlined" onClick={() => navigate('/institutes')}>Cancel</Button>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
}
