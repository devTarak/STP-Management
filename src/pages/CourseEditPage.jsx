import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Paper, Typography, TextField, Button, Stack, MenuItem, CircularProgress } from '@mui/material';
import { useCourse, useUpdateCourse } from '@/hooks/useCourses';

const levels = ['Pre-Vocational', '1', '2', '3', '4', '5', '6'];

export default function CourseEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: course, isLoading } = useCourse(id);
  const updateMutation = useUpdateCourse();
  const [form, setForm] = useState({ course_name: '', level: 'Pre-Vocational', project_name: '', venue: '' });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (course) {
      setForm({
        course_name: course.course_name || '',
        level: course.level || 'Pre-Vocational',
        project_name: course.project_name || '',
        venue: course.venue || '',
      });
    }
  }, [course]);

  const handleChange = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.course_name.trim()) errs.course_name = 'Course name is required';
    if (!form.level) errs.level = 'Level is required';
    if (!form.project_name.trim()) errs.project_name = 'Project name is required';
    if (!form.venue.trim()) errs.venue = 'Venue is required';
    setErrors(errs);
    if (Object.keys(errs).length) return;

    updateMutation.mutate({ id: Number(id), data: form }, {
      onSuccess: () => navigate('/courses'),
    });
  };

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={2} mb={3}>
        <Typography variant="h5" fontWeight={700}>Edit Course</Typography>
      </Stack>
      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, p: 3, maxWidth: 600 }}>
        <Stack component="form" onSubmit={handleSubmit} spacing={3}>
          <TextField label="Course Name" required value={form.course_name} onChange={handleChange('course_name')} error={!!errors.course_name} helperText={errors.course_name} />
          <TextField label="Level" select required value={form.level} onChange={handleChange('level')} error={!!errors.level} helperText={errors.level}>
            {levels.map((l) => <MenuItem key={l} value={l}>{l}</MenuItem>)}
          </TextField>
          <TextField label="Project Name" required value={form.project_name} onChange={handleChange('project_name')} error={!!errors.project_name} helperText={errors.project_name} />
          <TextField label="Venue" required value={form.venue} onChange={handleChange('venue')} error={!!errors.venue} helperText={errors.venue} />
          <Stack direction="row" spacing={2}>
            <Button variant="contained" type="submit" disabled={updateMutation.isPending}>Update</Button>
            <Button variant="outlined" onClick={() => navigate('/courses')}>Cancel</Button>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
}
