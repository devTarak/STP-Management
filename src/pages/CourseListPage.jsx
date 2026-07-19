import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, TablePagination, TableSortLabel, TextField, InputAdornment,
  IconButton, Typography, Button, Dialog, DialogTitle, DialogContent,
  DialogContentText, DialogActions, Stack, Skeleton,
} from '@mui/material';
import { Search, Edit, Delete, Add, Clear } from '@mui/icons-material';
import { useCourses, useDeleteCourse } from '@/hooks/useCourses';
import { formatDate } from '@/utils/helpers';

const rowsPerPageOptions = [10, 25, 50, 100];

function TableSkeleton({ rows }) {
  return (
    <TableBody>
      {Array.from({ length: rows }).map((_, i) => (
        <TableRow key={i}>
          {Array.from({ length: 6 }).map((_, j) => (
            <TableCell key={j}><Skeleton variant="text" width={j === 2 ? 140 : 80} /></TableCell>
          ))}
        </TableRow>
      ))}
    </TableBody>
  );
}

export default function CourseListPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [sort, setSort] = useState('id');
  const [order, setOrder] = useState('DESC');
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null, name: '' });

  const params = { page: page + 1, per_page: rowsPerPage, search, sort, order };
  const { data, isLoading } = useCourses(params);
  const deleteMutation = useDeleteCourse();

  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  const searchTimeout = useCallback(((t) => (v) => { clearTimeout(t); t = setTimeout(() => { setSearch(v); setPage(0); }, 400); })(), []);

  const handleSort = (field) => {
    const isAsc = sort === field && order === 'ASC';
    setOrder(isAsc ? 'DESC' : 'ASC');
    setSort(field);
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={700}>Courses</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/courses/create')}>
          Add Course
        </Button>
      </Stack>

      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
        <Box sx={{ p: 2 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search courses..."
            value={searchInput}
            onChange={(e) => { setSearchInput(e.target.value); searchTimeout(e.target.value); }}
            InputProps={{
              startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment>,
              endAdornment: searchInput ? (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => { setSearchInput(''); setSearch(''); setPage(0); }}><Clear fontSize="small" /></IconButton>
                </InputAdornment>
              ) : null,
            }}
          />
        </Box>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>S/L</TableCell>
                {[{ id: 'course_name', label: 'Name' }, { id: 'level', label: 'Level' }, { id: 'project_name', label: 'Project' }, { id: 'venue', label: 'Venue' }, { id: 'created_at', label: 'Created' }].map(({ id, label }) => (
                  <TableCell key={id} sx={{ fontWeight: 600 }}>
                    <TableSortLabel active={sort === id} direction={sort === id ? order.toLowerCase() : 'desc'} onClick={() => handleSort(id)}>
                      {label}
                    </TableSortLabel>
                  </TableCell>
                ))}
                <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            {isLoading ? <TableSkeleton rows={rowsPerPage} /> : (
              <TableBody>
                {items.length === 0 ? (
                  <TableRow><TableCell colSpan={7} align="center" sx={{ py: 6 }}><Typography color="text.secondary">No courses found.</Typography></TableCell></TableRow>
                ) : items.map((course, index) => (
                  <TableRow key={course.id} hover sx={{ '&:last-child td': { border: 0 } }}>
                    <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                    <TableCell><Typography fontWeight={500}>{course.course_name}</Typography></TableCell>
                    <TableCell sx={{ textTransform: 'capitalize' }}>{course.level}</TableCell>
                    <TableCell>{course.project_name || '-'}</TableCell>
                    <TableCell>{course.venue || '-'}</TableCell>
                    <TableCell>{formatDate(course.created_at)}</TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => navigate(`/courses/${course.id}/edit`)}>
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => setDeleteDialog({ open: true, id: course.id, name: course.course_name })}>
                        <Delete fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            )}
          </Table>
        </TableContainer>

        <TablePagination component="div" count={total} page={page} onPageChange={(_, p) => setPage(p)} rowsPerPage={rowsPerPage} onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }} rowsPerPageOptions={rowsPerPageOptions} />
      </Paper>

      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, id: null, name: '' })}>
        <DialogTitle>Delete Course?</DialogTitle>
        <DialogContent><DialogContentText>Are you sure you want to delete <strong>{deleteDialog.name}</strong>? This cannot be undone.</DialogContentText></DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, id: null, name: '' })}>Cancel</Button>
          <Button onClick={() => { deleteMutation.mutate(deleteDialog.id); setDeleteDialog({ open: false, id: null, name: '' }); }} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
