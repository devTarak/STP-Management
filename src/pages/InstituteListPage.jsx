import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, TablePagination, TableSortLabel, IconButton, Typography,
  Button, Chip, Dialog, DialogTitle, DialogContent, DialogContentText,
  DialogActions, Stack, TextField, InputAdornment, Skeleton,
} from '@mui/material';
import { Search, Edit, Delete, Add, Clear, Visibility } from '@mui/icons-material';
import { useInstitutes, useDeleteInstitute, useToggleInstituteStatus } from '@/hooks/useInstitutes';
import { formatDate } from '@/utils/helpers';

const rowsPerPageOptions = [10, 25, 50, 100];

export default function InstituteListPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [sort, setSort] = useState('id');
  const [order, setOrder] = useState('DESC');
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null, name: '' });
  const debounceRef = useRef(null);

  useEffect(() => {
    debounceRef.current = setTimeout(() => {
      setSearch(searchInput);
      setPage(0);
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [searchInput]);

  const params = { page: page + 1, per_page: rowsPerPage, search: search || undefined, sort, order };
  const { data, isLoading } = useInstitutes(params);
  const deleteMutation = useDeleteInstitute();
  const toggleMutation = useToggleInstituteStatus();

  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={700}>Institute Management</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/institutes/create')}>Add Institute</Button>
      </Stack>

      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
        <Box sx={{ p: 2 }}>
          <TextField size="small" placeholder="Search institutes..." value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment>,
              endAdornment: searchInput ? <InputAdornment position="end"><IconButton size="small" onClick={() => { setSearchInput(''); setSearch(''); setPage(0); }}><Clear fontSize="small" /></IconButton></InputAdornment> : null,
            }}
            sx={{ minWidth: 300 }}
          />
        </Box>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                {[{ id: 'name', label: 'Institute' }, { id: 'stp_code', label: 'STP Code' }, { id: 'email', label: 'Email' }, { id: 'contact_no', label: 'Contact' }, { id: 'status', label: 'Status' }, { id: 'created_at', label: 'Created' }].map(({ id, label }) => (
                  <TableCell key={id} sx={{ fontWeight: 600 }}>
                    <TableSortLabel active={sort === id} direction={sort === id ? order.toLowerCase() : 'desc'} onClick={() => { const isAsc = sort === id && order === 'ASC'; setOrder(isAsc ? 'DESC' : 'ASC'); setSort(id); }}>{label}</TableSortLabel>
                  </TableCell>
                ))}
                <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            {isLoading ? (
              <TableBody>{Array.from({ length: rowsPerPage }).map((_, i) => (<TableRow key={i}>{Array.from({ length: 7 }).map((_, j) => (<TableCell key={j}><Skeleton variant="text" width={j === 1 ? 160 : 80} /></TableCell>))}</TableRow>))}</TableBody>
            ) : (
              <TableBody>
                {items.length === 0 ? (
                  <TableRow><TableCell colSpan={7} align="center" sx={{ py: 6 }}><Typography color="text.secondary">No institutes found.</Typography></TableCell></TableRow>
                ) : items.map((inst) => (
                  <TableRow key={inst.id} hover sx={{ '&:last-child td': { border: 0 } }}>
                    <TableCell>
                      <Typography fontWeight={500}>{inst.name}</Typography>
                      {inst.name_bn && <Typography variant="caption" color="text.secondary">{inst.name_bn}</Typography>}
                    </TableCell>
                    <TableCell>{inst.stp_code || '-'}</TableCell>
                    <TableCell>{inst.email || '-'}</TableCell>
                    <TableCell>{inst.contact_no || '-'}</TableCell>
                    <TableCell>
                      <Chip
                        label={inst.status}
                        color={inst.status === 'active' ? 'success' : 'default'}
                        size="small"
                        onClick={() => toggleMutation.mutate(inst.id)}
                        clickable
                      />
                    </TableCell>
                    <TableCell>{formatDate(inst.created_at)}</TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => navigate(`/institute`)}><Visibility fontSize="small" /></IconButton>
                      <IconButton size="small" onClick={() => navigate(`/institutes/${inst.id}/edit`)}><Edit fontSize="small" /></IconButton>
                      <IconButton size="small" color="error" onClick={() => setDeleteDialog({ open: true, id: inst.id, name: inst.name })}><Delete fontSize="small" /></IconButton>
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
        <DialogTitle>Delete Institute?</DialogTitle>
        <DialogContent><DialogContentText>Delete <strong>{deleteDialog.name}</strong> and all its data? Cannot undo.</DialogContentText></DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, id: null, name: '' })}>Cancel</Button>
          <Button onClick={() => { deleteMutation.mutate(deleteDialog.id); setDeleteDialog({ open: false, id: null, name: '' }); }} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
