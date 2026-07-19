import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Paper, Typography, TextField, Button, Stack, MenuItem, FormControl, InputLabel, Select, Autocomplete } from '@mui/material';
import { useCreateUser } from '@/hooks/useUsers';
import { useInstitutes } from '@/hooks/useInstitutes';
import { useAuth } from '@/hooks/useAuth';

export default function UserCreatePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const createMutation = useCreateUser();
  const { data: institutesData } = useInstitutes({ per_page: 200 });
  const institutes = institutesData?.items ?? [];
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'admin', status: 'active', institute_id: '' });
  const [errors, setErrors] = useState({});

  const handleChange = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email';
    if (!form.password || form.password.length < 6) errs.password = 'Password must be at least 6 characters';
    if (form.role === 'admin' && !form.institute_id) errs.institute_id = 'Institute is required for admin users';
    setErrors(errs);
    if (Object.keys(errs).length) return;

    createMutation.mutate(form, { onSuccess: () => navigate('/users') });
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} mb={3}>Create User</Typography>
      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, p: 3, maxWidth: 600 }}>
        <Stack component="form" onSubmit={handleSubmit} spacing={3}>
          <TextField label="Name" required value={form.name} onChange={handleChange('name')} error={!!errors.name} helperText={errors.name} />
          <TextField label="Email" type="email" required value={form.email} onChange={handleChange('email')} error={!!errors.email} helperText={errors.email} />
          <TextField label="Password" type="password" required value={form.password} onChange={handleChange('password')} error={!!errors.password} helperText={errors.password} />
          <FormControl>
            <InputLabel>Role</InputLabel>
            <Select value={form.role} label="Role" onChange={handleChange('role')}>
              <MenuItem value="admin">Admin</MenuItem>
            </Select>
          </FormControl>
          {user?.role === 'super_admin' && form.role === 'admin' && (
            <Autocomplete
              options={institutes}
              getOptionLabel={(option) => option.name || ''}
              value={institutes.find((i) => i.id === Number(form.institute_id)) || null}
              onChange={(_, newVal) => setForm((prev) => ({ ...prev, institute_id: newVal ? String(newVal.id) : '' }))}
              isOptionEqualToValue={(opt, val) => opt.id === val.id}
              renderInput={(params) => (
                <TextField {...params} label="Institute" error={!!errors.institute_id}
                  helperText={errors.institute_id} />
              )}
              noOptionsText="No institutes found"
            />
          )}
          <FormControl>
            <InputLabel>Status</InputLabel>
            <Select value={form.status} label="Status" onChange={handleChange('status')}>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </Select>
          </FormControl>
          <Stack direction="row" spacing={2}>
            <Button variant="contained" type="submit" disabled={createMutation.isPending}>Create</Button>
            <Button variant="outlined" onClick={() => navigate('/users')}>Cancel</Button>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
}
