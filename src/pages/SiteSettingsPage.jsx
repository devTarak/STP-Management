import { useState, useEffect, useRef } from 'react';
import { Box, Paper, Typography, TextField, Button, Stack, Grid, Avatar, IconButton, CircularProgress, Autocomplete } from '@mui/material';
import { PhotoCamera } from '@mui/icons-material';
import { useSiteSettings, useUpdateSiteSettings } from '@/hooks/useSiteSettings';
import { useDivisions, useDistricts, useUpazilas } from '@/hooks/useBdAddress';

export default function SiteSettingsPage() {
  const { data: settings, isLoading } = useSiteSettings();
  const updateMutation = useUpdateSiteSettings();
  const faviconRef = useRef(null);
  const stampRef = useRef(null);
  const [form, setForm] = useState({
    name: '', name_bn: '', address: '', country: '', division_id: '',
    district_id: '', upazila_id: '', contact_no: '', stp_code: '', email: '', ref_prefix: '',
  });
  const [files, setFiles] = useState({ favicon: null, stamp: null });
  const [previews, setPreviews] = useState({ favicon: null, stamp: null });

  const { data: divisions = [] } = useDivisions();
  const { data: districts = [] } = useDistricts(form.division_id || null);
  const { data: upazilas = [] } = useUpazilas(form.district_id || null);

  const selectedDivision = divisions.find((d) => String(d.id) === form.division_id) || null;
  const selectedDistrict = districts.find((d) => String(d.id) === form.district_id) || null;
  const selectedUpazila = upazilas.find((u) => String(u.id) === form.upazila_id) || null;

  useEffect(() => {
    if (settings) {
      setForm({
        name: settings.name || '',
        name_bn: settings.name_bn || '',
        address: settings.address || '',
        country: settings.country || '',
        division_id: String(settings.division || ''),
        district_id: String(settings.district || ''),
        upazila_id: String(settings.upazila || ''),
        contact_no: settings.contact_no || '',
        stp_code: settings.stp_code || '',
        email: settings.email || '',
        ref_prefix: settings.ref_prefix || '',
      });
      setPreviews({ favicon: settings.favicon_url || null, stamp: settings.stamp_url || null });
    }
  }, [settings]);

  const handleChange = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleFile = (field) => (e) => {
    const file = e.target.files[0];
    if (file) {
      setFiles((prev) => ({ ...prev, [field]: file }));
      setPreviews((prev) => ({ ...prev, [field]: URL.createObjectURL(file) }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      const key = k === 'division_id' ? 'division' : k === 'district_id' ? 'district' : k === 'upazila_id' ? 'upazila' : k;
      if (v) formData.append(key, v);
    });
    if (files.favicon) formData.append('favicon', files.favicon);
    if (files.stamp) formData.append('stamp', files.stamp);
    updateMutation.mutate(formData);
  };

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} mb={3}>Site Settings</Typography>
      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, p: 3, maxWidth: 800 }}>
        <Stack component="form" onSubmit={handleSubmit} spacing={3}>
          <Typography variant="subtitle1" fontWeight={600}>Institute Information</Typography>
          <TextField label="Institute Name" value={form.name} onChange={handleChange('name')} />
          <TextField label="Institute Name (BN)" value={form.name_bn} onChange={handleChange('name_bn')} />
          <TextField label="Address" multiline rows={2} value={form.address} onChange={handleChange('address')} />
          <Grid container spacing={2}>
            <Grid item xs={4}><TextField label="Country" fullWidth value={form.country} onChange={handleChange('country')} /></Grid>
            <Grid item xs={4}>
              <Autocomplete
                options={divisions}
                getOptionLabel={(o) => o.name || ''}
                value={selectedDivision}
                onChange={(_, v) => setForm((p) => ({ ...p, division_id: v ? String(v.id) : '', district_id: '', upazila_id: '' }))}
                isOptionEqualToValue={(o, v) => String(o.id) === String(v.id)}
                renderInput={(params) => <TextField {...params} label="Division" fullWidth />}
              />
            </Grid>
            <Grid item xs={4}>
              <Autocomplete
                options={districts}
                getOptionLabel={(o) => o.name || ''}
                value={selectedDistrict}
                onChange={(_, v) => setForm((p) => ({ ...p, district_id: v ? String(v.id) : '', upazila_id: '' }))}
                isOptionEqualToValue={(o, v) => String(o.id) === String(v.id)}
                renderInput={(params) => <TextField {...params} label="District" fullWidth />}
                disabled={!form.division_id}
              />
            </Grid>
            <Grid item xs={4}>
              <Autocomplete
                options={upazilas}
                getOptionLabel={(o) => o.name || ''}
                value={selectedUpazila}
                onChange={(_, v) => setForm((p) => ({ ...p, upazila_id: v ? String(v.id) : '' }))}
                isOptionEqualToValue={(o, v) => String(o.id) === String(v.id)}
                renderInput={(params) => <TextField {...params} label="Upazila" fullWidth />}
                disabled={!form.district_id}
              />
            </Grid>
            <Grid item xs={4}><TextField label="Contact No" fullWidth value={form.contact_no} onChange={handleChange('contact_no')} /></Grid>
            <Grid item xs={4}><TextField label="STP Code" fullWidth value={form.stp_code} onChange={handleChange('stp_code')} /></Grid>
            <Grid item xs={6}><TextField label="Email" type="email" fullWidth value={form.email} onChange={handleChange('email')} /></Grid>
            <Grid item xs={6}><TextField label="Ref Prefix" fullWidth value={form.ref_prefix} onChange={handleChange('ref_prefix')} /></Grid>
          </Grid>

          <Typography variant="subtitle1" fontWeight={600}>Branding</Typography>
          <Stack direction="row" spacing={4}>
            <Box>
              <Typography variant="body2" mb={1}>Favicon</Typography>
              <Avatar src={previews.favicon} sx={{ width: 64, height: 64, border: '2px dashed', borderColor: 'divider', bgcolor: 'grey.100' }}>
                <IconButton onClick={() => faviconRef.current?.click()}><PhotoCamera /></IconButton>
              </Avatar>
              <input ref={faviconRef} type="file" hidden accept="image/*" onChange={handleFile('favicon')} />
            </Box>
            <Box>
              <Typography variant="body2" mb={1}>Stamp / Logo</Typography>
              <Avatar src={previews.stamp} sx={{ width: 64, height: 64, border: '2px dashed', borderColor: 'divider', bgcolor: 'grey.100' }}>
                <IconButton onClick={() => stampRef.current?.click()}><PhotoCamera /></IconButton>
              </Avatar>
              <input ref={stampRef} type="file" hidden accept="image/*" onChange={handleFile('stamp')} />
            </Box>
          </Stack>

          <Stack direction="row" spacing={2}>
            <Button variant="contained" type="submit" disabled={updateMutation.isPending}>Save Settings</Button>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
}
