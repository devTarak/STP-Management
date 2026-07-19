import { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Stack } from '@mui/material';
import { authService } from '@/services/authService';
import { parseApiError } from '@/utils/errorHandler';
import toast from 'react-hot-toast';

export default function ChangePasswordDialog({ open, onClose }) {
  const [form, setForm] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.current_password) errs.current_password = 'Current password is required';
    if (!form.new_password || form.new_password.length < 6) errs.new_password = 'New password must be at least 6 characters';
    if (form.new_password !== form.confirm_password) errs.confirm_password = 'Passwords do not match';
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    try {
      const res = await authService.changePassword(form);
      if (res?.success) {
        toast.success('Password changed successfully.');
        setForm({ current_password: '', new_password: '', confirm_password: '' });
        onClose();
      } else {
        toast.error(res?.message || 'Failed to change password.');
      }
    } catch (err) {
      const parsed = parseApiError(err);
      toast.error(parsed.message || 'Failed to change password.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setForm({ current_password: '', new_password: '', confirm_password: '' });
      setErrors({});
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>Change Password</DialogTitle>
      <DialogContent>
        <Stack component="form" onSubmit={handleSubmit} spacing={2.5} sx={{ mt: 1 }}>
          <TextField label="Current Password" type="password" required fullWidth value={form.current_password} onChange={handleChange('current_password')} error={!!errors.current_password} helperText={errors.current_password} />
          <TextField label="New Password" type="password" required fullWidth value={form.new_password} onChange={handleChange('new_password')} error={!!errors.new_password} helperText={errors.new_password} />
          <TextField label="Confirm New Password" type="password" required fullWidth value={form.confirm_password} onChange={handleChange('confirm_password')} error={!!errors.confirm_password} helperText={errors.confirm_password} />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={loading}>Change Password</Button>
      </DialogActions>
    </Dialog>
  );
}
