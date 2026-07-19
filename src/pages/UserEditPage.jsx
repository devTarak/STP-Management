import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Paper, Typography, TextField, Button, Stack, MenuItem, FormControl, InputLabel, Select, CircularProgress, Autocomplete } from '@mui/material';
import { useUser, useUpdateUser } from '@/hooks/useUsers';
import { useInstitutes } from '@/hooks/useInstitutes';
import { useAuth } from '@/hooks/useAuth';

export default function UserEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { data: user, isLoading } = useUser(id);
  const updateMutation = useUpdateUser();
  const { data: institutesData } = useInstitutes({ per_page: 200 });
  const institutes = institutesData?.items ?? [];
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'admin', status: 'active', institute_id: '' });
  const [errors, setErrors] = useState({});

  const isSelf = currentUser?.id === Number(id);
  const isSuperAdminUser = user?.role === 'super_admin';
  const canChangeRole = currentUser?.role === 'super_admin';
  const canChangeStatus = !isSelf;
  const canEditThisUser = currentUser?.role === 'super_admin' || !isSuperAdminUser;
  const isSuperAdmin = currentUser?.role === 'super_admin';

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        email: user.email || '',
        password: '',
        role: user.role || 'admin',
        status: user.status || 'active',
        institute_id: user.institute_id ? String(user.institute_id) : '',
      });
    }
  }, [user]);

  const handleChange = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email';
    if (form.password && form.password.length < 6) errs.password = 'Password must be at least 6 characters';
    setErrors(errs);
    if (Object.keys(errs).length) return;

    const payload = { name: form.name, email: form.email };
    if (canChangeRole) payload.role = form.role;
    if (canChangeStatus) payload.status = form.status;
    if (form.password) payload.password = form.password;
    if (isSuperAdmin && form.institute_id) payload.institute_id = Number(form.institute_id);

    updateMutation.mutate({ id: Number(id), data: payload }, { onSuccess: () => navigate('/users') });
  };

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;

  if (!user) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><Typography color="text.secondary">User not found.</Typography></Box>;

  if (!canEditThisUser) {
    return (
      <Box>
        <Typography variant="h5" fontWeight={700} mb={3}>Edit User</Typography>
        <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, p: 3, maxWidth: 600 }}>
          <Typography color="error">You do not have permission to edit this user.</Typography>
          <Button variant="outlined" sx={{ mt: 2 }} onClick={() => navigate('/users')}>Back to Users</Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} mb={3}>Edit User</Typography>
      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, p: 3, maxWidth: 600 }}>
        <Stack component="form" onSubmit={handleSubmit} spacing={3}>
          <TextField label="Name" required value={form.name} onChange={handleChange('name')} error={!!errors.name} helperText={errors.name} />
          <TextField label="Email" type="email" required value={form.email} onChange={handleChange('email')} error={!!errors.email} helperText={errors.email} />
          <TextField label="New Password (leave blank to keep)" type="password" value={form.password} onChange={handleChange('password')} error={!!errors.password} helperText={errors.password} />
          <FormControl>
            <InputLabel>Role</InputLabel>
            <Select value={form.role} label="Role" onChange={handleChange('role')} disabled={!canChangeRole}>
              <MenuItem value="admin">Admin</MenuItem>
            </Select>
          </FormControl>
          {isSuperAdmin && form.role === 'admin' && (
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
            <Select value={form.status} label="Status" onChange={handleChange('status')} disabled={!canChangeStatus}>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </Select>
          </FormControl>
          <Stack direction="row" spacing={2}>
            <Button variant="contained" type="submit" disabled={updateMutation.isPending}>Update</Button>
            <Button variant="outlined" onClick={() => navigate('/users')}>Cancel</Button>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
}
