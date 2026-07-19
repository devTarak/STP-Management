import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, TablePagination, TableSortLabel, TextField, InputAdornment,
  Select, MenuItem, FormControl, InputLabel, Chip, IconButton,
  Typography, Button, Tooltip, Menu, ListItemIcon, Stack, Grid, Skeleton, Autocomplete,
} from '@mui/material';
import { Search, Visibility, CheckCircle, Cancel, MoreVert, FilterList, Clear, Print } from '@mui/icons-material';
import { useStudents, useUpdateStudentStatus } from '@/hooks/useStudents';
import { useBatches } from '@/hooks/useBatches';
import { useAuth } from '@/hooks/useAuth';
import { formatDate, getStatusColor } from '@/utils/helpers';
import RejectDialog from '@/components/common/RejectDialog';
import api from '@/config/api';

const rowsPerPageOptions = [10, 25, 50, 100];

function StatusChip({ status }) {
  return <Chip label={status ? status.charAt(0).toUpperCase() + status.slice(1) : '-'} color={getStatusColor(status)} size="small" variant={status === 'pending' ? 'outlined' : 'filled'} />;
}

export default function ApplicationsListPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'super_admin';

  const statusFilters = isSuperAdmin
    ? [{ value: '', label: 'All Statuses' }, { value: 'pending', label: 'Pending' }, { value: 'approved', label: 'Approved' }, { value: 'rejected', label: 'Rejected' }]
    : [{ value: '', label: 'All Statuses' }, { value: 'pending', label: 'Pending' }, { value: 'rejected', label: 'Rejected' }];

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState(isSuperAdmin ? '' : '');
  const [batchFilter, setBatchFilter] = useState(null);
  const [batchKey, setBatchKey] = useState(0);
  const [sort, setSort] = useState('id');
  const [order, setOrder] = useState('DESC');
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [rejectDialog, setRejectDialog] = useState({ open: false, student: null });

  const statusParam = statusFilter || (isSuperAdmin ? undefined : 'pending,rejected');
  const params = { page: page + 1, per_page: rowsPerPage, search, sort, order, status: statusParam, batch_id: batchFilter?.id ?? undefined };
  const { data, isLoading } = useStudents(params);
  const { data: batchesData } = useBatches({ per_page: 200, sort: 'name', order: 'ASC', status: 'active' });
  const batches = batchesData?.items ?? [];
  const statusMutation = useUpdateStudentStatus();

  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  const searchTimeout = useCallback(((t) => (v) => { clearTimeout(t); t = setTimeout(() => { setSearch(v); setPage(0); }, 400); })(), []);

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={700}>Applications</Typography>
        <Typography variant="body2" color="text.secondary">{total} total</Typography>
      </Stack>

      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, overflow: 'visible' }}>
        <Box sx={{ p: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm>
              <TextField fullWidth size="small" placeholder="Search by name, ref no..." value={searchInput}
                onChange={(e) => { setSearchInput(e.target.value); searchTimeout(e.target.value); }}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment>,
                  endAdornment: searchInput ? <InputAdornment position="end"><IconButton size="small" onClick={() => { setSearchInput(''); setSearch(''); setPage(0); }}><Clear fontSize="small" /></IconButton></InputAdornment> : null,
                }}
              />
            </Grid>
            <Grid item xs={12} sm="auto">
              <FormControl sx={{ minWidth: 140 }} size="small">
                <InputLabel>Status</InputLabel>
                <Select value={statusFilter} label="Status" onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
                  MenuProps={{ disablePortal: false, sx: { zIndex: 1300 } }}>
                  {statusFilters.map((opt) => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm="auto">
              <Autocomplete
                key={`batch-${batchKey}`}
                size="small"
                options={batches}
                getOptionLabel={(option) => option.name || ''}
                value={batchFilter}
                onChange={(_, val) => { setBatchFilter(val); setPage(0); }}
                renderInput={(params) => <TextField {...params} placeholder="Search batch..." />}
                isOptionEqualToValue={(option, val) => option.id === val.id}
                noOptionsText="No batches found"
                disablePortal={false}
                slotProps={{ popper: { sx: { zIndex: 1300 } } }}
                sx={{ minWidth: 180 }}
              />
            </Grid>
            {(statusFilter || batchFilter) && (
              <Grid item xs={12} sm="auto">
                <Button size="small" variant="outlined" startIcon={<Clear />} onClick={() => { setStatusFilter(''); setBatchFilter(null); setBatchKey((k) => k + 1); setPage(0); }}>Clear</Button>
              </Grid>
            )}
          </Grid>
        </Box>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                {[{ id: 'ref_no', label: 'Ref No' }, { id: 'name_en', label: 'Name' }, { id: 'course_name', label: 'Course' }, { id: 'status', label: 'Status' }, { id: 'created_at', label: 'Applied' }].map(({ id, label }) => (
                  <TableCell key={id} sx={{ fontWeight: 600 }}>
                    <TableSortLabel active={sort === id} direction={sort === id ? order.toLowerCase() : 'desc'} onClick={() => { const isAsc = sort === id && order === 'ASC'; setOrder(isAsc ? 'DESC' : 'ASC'); setSort(id); }}>{label}</TableSortLabel>
                  </TableCell>
                ))}
                <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            {isLoading ? (
              <TableBody>{Array.from({ length: rowsPerPage }).map((_, i) => (<TableRow key={i}>{Array.from({ length: 6 }).map((_, j) => (<TableCell key={j}><Skeleton variant="text" width={j === 2 ? 140 : 80} /></TableCell>))}</TableRow>))}</TableBody>
            ) : (
              <TableBody>
                {items.length === 0 ? (
                  <TableRow><TableCell colSpan={6} align="center" sx={{ py: 6 }}><Typography color="text.secondary">No applications found.</Typography></TableCell></TableRow>
                ) : items.map((s) => (
                  <TableRow key={s.id} hover sx={{ cursor: 'pointer', '&:last-child td': { border: 0 } }} onClick={() => navigate(`/students/${s.id}`)}>
                    <TableCell><Typography variant="body2" fontWeight={500}>{s.ref_no || '-'}</Typography></TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>{s.name_en || 'N/A'}</Typography>
                      {s.name_bn && <Typography variant="caption" color="text.secondary">{s.name_bn}</Typography>}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>{s.batch_name || '-'}</Typography>
                      <Typography variant="caption" color="text.secondary">{s.course_name}</Typography>
                    </TableCell>
                    <TableCell><StatusChip status={s.status} /></TableCell>
                    <TableCell><Typography variant="body2">{formatDate(s.created_at)}</Typography></TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={(e) => { e.stopPropagation(); setMenuAnchor(e.currentTarget); setSelectedStudent(s); }}>
                        <MoreVert fontSize="small" />
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

      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => { setMenuAnchor(null); setSelectedStudent(null); }}>
        <MenuItem onClick={() => { navigate(`/students/${selectedStudent?.id}`); setMenuAnchor(null); }}>
          <ListItemIcon><Visibility fontSize="small" /></ListItemIcon> View
        </MenuItem>
        <MenuItem onClick={() => { const token = localStorage.getItem('auth_token'); const base = api.defaults.baseURL.replace(/\/api\/?$/, ''); window.open(`${base}/api/students/${selectedStudent?.id}/print?token=${token}`, '_blank'); setMenuAnchor(null); }}>
          <ListItemIcon><Print fontSize="small" /></ListItemIcon> Print
        </MenuItem>
        {selectedStudent?.status === 'pending' && [
          <MenuItem key="approve" onClick={() => { statusMutation.mutate({ id: selectedStudent.id, data: { status: 'approved' } }); setMenuAnchor(null); }}>
            <ListItemIcon><CheckCircle fontSize="small" color="success" /></ListItemIcon> Approve
          </MenuItem>,
          <MenuItem key="reject" onClick={() => { setMenuAnchor(null); setRejectDialog({ open: true, student: selectedStudent }); }}>
            <ListItemIcon><Cancel fontSize="small" color="error" /></ListItemIcon> Reject
          </MenuItem>,
        ]}
      </Menu>

      <RejectDialog
        open={rejectDialog.open}
        onClose={() => setRejectDialog({ open: false, student: null })}
        onConfirm={(feedback) => {
          if (rejectDialog.student) {
            statusMutation.mutate({ id: rejectDialog.student.id, data: { status: 'rejected', rejection_feedback: feedback } });
          }
          setRejectDialog({ open: false, student: null });
        }}
      />
    </Box>
  );
}
