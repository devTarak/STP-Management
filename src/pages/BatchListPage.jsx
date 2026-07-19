import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, TablePagination, TableSortLabel, TextField, InputAdornment,
  IconButton, Typography, Button, Chip, Dialog, DialogTitle, DialogContent,
  DialogContentText, DialogActions, Stack, Grid, FormControl, InputLabel, Select, MenuItem, Skeleton,
} from '@mui/material';
import { Search, Edit, Delete, Add, Clear } from '@mui/icons-material';
import { useBatches, useDeleteBatch } from '@/hooks/useBatches';
import { useCourses } from '@/hooks/useCourses';
import { formatDate } from '@/utils/helpers';

const rowsPerPageOptions = [10, 25, 50, 100];

function TableSkeleton({ rows }) {
  return (
    <TableBody>
      {Array.from({ length: rows }).map((_, i) => (
        <TableRow key={i}>
          {Array.from({ length: 9 }).map((_, j) => (
            <TableCell key={j}><Skeleton variant="text" width={j === 2 ? 140 : 80} /></TableCell>
          ))}
        </TableRow>
      ))}
    </TableBody>
  );
}

export default function BatchListPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [sort, setSort] = useState('id');
  const [order, setOrder] = useState('DESC');
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null, name: '' });

  const params = { page: page + 1, per_page: rowsPerPage, search, sort, order, status: statusFilter || undefined, course_id: courseFilter || undefined };
  const { data, isLoading } = useBatches(params);
  const { data: coursesData } = useCourses({ per_page: 200, sort: 'course_name', order: 'ASC' });
  const courses = coursesData?.items ?? [];
  const deleteMutation = useDeleteBatch();

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
        <Typography variant="h5" fontWeight={700}>Batches</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/batches/create')}>
          Add Batch
        </Button>
      </Stack>

      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, overflow: 'visible' }}>
        <Box sx={{ p: 2, pb: 0 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm>
              <TextField fullWidth size="small" placeholder="Search batches..." value={searchInput} onChange={(e) => { setSearchInput(e.target.value); searchTimeout(e.target.value); }}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment>,
                  endAdornment: searchInput ? (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => { setSearchInput(''); setSearch(''); setPage(0); }}><Clear fontSize="small" /></IconButton>
                    </InputAdornment>
                  ) : null,
                }}
              />
            </Grid>
            <Grid item xs={12} sm="auto">
              <FormControl sx={{ minWidth: 140 }} size="small">
                <InputLabel>Status</InputLabel>
                <Select value={statusFilter} label="Status" onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
                  MenuProps={{ disablePortal: false, sx: { zIndex: 1300 } }}>
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm="auto">
              <FormControl sx={{ minWidth: 180 }} size="small">
                <InputLabel>Course</InputLabel>
                <Select value={courseFilter} label="Course" onChange={(e) => { setCourseFilter(e.target.value); setPage(0); }}
                  MenuProps={{ disablePortal: false, sx: { zIndex: 1300 } }}>
                  <MenuItem value="">All</MenuItem>
                  {courses.map((c) => <MenuItem key={c.id} value={c.id}>{c.course_name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>S/L</TableCell>
                {[{ id: 'name', label: 'Name' }, { id: 'course_name', label: 'Course' }, { id: 'capacity', label: 'Capacity' }, { id: 'start_date', label: 'Start Date' }, { id: 'end_date', label: 'End Date' }, { id: 'status', label: 'Status' }, { id: 'created_at', label: 'Created' }].map(({ id, label }) => (
                  <TableCell key={id} sx={{ fontWeight: 600 }}>
                    <TableSortLabel active={sort === id} direction={sort === id ? order.toLowerCase() : 'desc'} onClick={() => handleSort(id)}>{label}</TableSortLabel>
                  </TableCell>
                ))}
                <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            {isLoading ? <TableSkeleton rows={rowsPerPage} /> : (
              <TableBody>
                {items.length === 0 ? (
                  <TableRow><TableCell colSpan={9} align="center" sx={{ py: 6 }}><Typography color="text.secondary">No batches found.</Typography></TableCell></TableRow>
                ) : items.map((batch, index) => (
                  <TableRow key={batch.id} hover sx={{ '&:last-child td': { border: 0 } }}>
                    <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                    <TableCell><Typography fontWeight={500}>{batch.name}</Typography></TableCell>
                    <TableCell>{batch.course_name || '-'}</TableCell>
                    <TableCell>{batch.capacity ?? 0}</TableCell>
                    <TableCell>{formatDate(batch.start_date)}</TableCell>
                    <TableCell>{formatDate(batch.end_date)}</TableCell>
                    <TableCell><Chip label={batch.status} color={batch.status === 'active' ? 'success' : 'default'} size="small" /></TableCell>
                    <TableCell>{formatDate(batch.created_at)}</TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => navigate(`/batches/${batch.id}/edit`)}><Edit fontSize="small" /></IconButton>
                      <IconButton size="small" color="error" onClick={() => setDeleteDialog({ open: true, id: batch.id, name: batch.name })}><Delete fontSize="small" /></IconButton>
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
        <DialogTitle>Delete Batch?</DialogTitle>
        <DialogContent><DialogContentText>Delete <strong>{deleteDialog.name}</strong>? Cannot undo.</DialogContentText></DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, id: null, name: '' })}>Cancel</Button>
          <Button onClick={() => { deleteMutation.mutate(deleteDialog.id); setDeleteDialog({ open: false, id: null, name: '' }); }} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
