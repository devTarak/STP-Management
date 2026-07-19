import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Paper, Typography, TextField, Button, Stack, MenuItem, FormControl, InputLabel, Select } from '@mui/material';
import { useCreateBatch } from '@/hooks/useBatches';
import { useCourses } from '@/hooks/useCourses';

export default function BatchCreatePage() {
  const navigate = useNavigate();
  const createMutation = useCreateBatch();
  const { data: coursesData } = useCourses({ per_page: 200 });
  const courses = coursesData?.items ?? [];
  const [form, setForm] = useState({ course_id: '', name: '', capacity: '', status: 'active', start_date: '', end_date: '' });
  const [errors, setErrors] = useState({});

  const handleChange = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.course_id) errs.course_id = 'Course is required';
    if (!form.name.trim()) errs.name = 'Batch name is required';
    if (!form.capacity || Number(form.capacity) < 1) errs.capacity = 'Capacity must be at least 1';
    setErrors(errs);
    if (Object.keys(errs).length) return;

    createMutation.mutate({ ...form, capacity: Number(form.capacity) }, {
      onSuccess: () => navigate('/batches'),
    });
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} mb={3}>Create Batch</Typography>
      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, p: 3, maxWidth: 600 }}>
        <Stack component="form" onSubmit={handleSubmit} spacing={3}>
          <FormControl error={!!errors.course_id}>
            <InputLabel>Course</InputLabel>
            <Select value={form.course_id} label="Course" onChange={handleChange('course_id')}>
              {courses.map((c) => <MenuItem key={c.id} value={c.id}>{c.course_name}</MenuItem>)}
            </Select>
            {errors.course_id && <Typography variant="caption" color="error">{errors.course_id}</Typography>}
          </FormControl>
          <TextField label="Batch Name" required value={form.name} onChange={handleChange('name')} error={!!errors.name} helperText={errors.name} />
          <TextField label="Capacity" type="number" required value={form.capacity} onChange={handleChange('capacity')} error={!!errors.capacity} helperText={errors.capacity} inputProps={{ min: 1 }} />
          <TextField
            label="Start Date"
            type="date"
            value={form.start_date}
            onChange={handleChange('start_date')}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="End Date"
            type="date"
            value={form.end_date}
            onChange={handleChange('end_date')}
            InputLabelProps={{ shrink: true }}
          />
          <FormControl>
            <InputLabel>Status</InputLabel>
            <Select value={form.status} label="Status" onChange={handleChange('status')}>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </Select>
          </FormControl>
          <Stack direction="row" spacing={2}>
            <Button variant="contained" type="submit" disabled={createMutation.isPending}>Create</Button>
            <Button variant="outlined" onClick={() => navigate('/batches')}>Cancel</Button>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
}
