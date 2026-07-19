import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, TablePagination, TableSortLabel, TextField, InputAdornment,
  IconButton, Typography, Button, Chip, Stack, Tooltip, Dialog, DialogTitle,
  DialogContent, DialogContentText, DialogActions, Select, MenuItem,
  FormControl, InputLabel, Skeleton, Grid,
} from '@mui/material';
import { Search, Edit, Delete, Add, Clear } from '@mui/icons-material';
import { useUsers, useDeleteUser, useToggleUserStatus } from '@/hooks/useUsers';
import { useInstitutes } from '@/hooks/useInstitutes';
import { useAuth } from '@/hooks/useAuth';
import { formatDate } from '@/utils/helpers';

const rowsPerPageOptions = [10, 25, 50, 100];

export default function UserListPage() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [instituteFilter, setInstituteFilter] = useState('');
  const [sort, setSort] = useState('id');
  const [order, setOrder] = useState('DESC');
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null, name: '' });

  const isSuperAdminUser = currentUser?.role === 'super_admin';
  const { data: institutesData } = useInstitutes({ per_page: 200 });
  const institutes = institutesData?.items ?? [];

  const params = { page: page + 1, per_page: rowsPerPage, search, sort, order, role: roleFilter || undefined, institute_id: instituteFilter || undefined };
  const { data, isLoading } = useUsers(params);
  const deleteMutation = useDeleteUser();
  const toggleMutation = useToggleUserStatus();

  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  const searchTimeout = useCallback(((t) => (v) => { clearTimeout(t); t = setTimeout(() => { setSearch(v); setPage(0); }, 400); })(), []);

  const isSelf = (userId) => currentUser?.id === userId;
  const isSuperAdminRole = (role) => role === 'super_admin';
  const canToggle = (user) => !isSelf(user.id) && !(isSuperAdminRole(user.role) && !isSuperAdminUser);
  const canDelete = (user) => !isSelf(user.id) && !(isSuperAdminRole(user.role) && !isSuperAdminUser);
  const canEdit = (user) => !(isSuperAdminRole(user.role) && !isSuperAdminUser);

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={700}>User Management</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/users/create')}>Add User</Button>
      </Stack>

      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, overflow: 'visible' }}>
        <Box sx={{ p: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm>
              <TextField fullWidth size="small" placeholder="Search users..." value={searchInput}
                onChange={(e) => { setSearchInput(e.target.value); searchTimeout(e.target.value); }}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment>,
                  endAdornment: searchInput ? <InputAdornment position="end"><IconButton size="small" onClick={() => { setSearchInput(''); setSearch(''); setPage(0); }}><Clear fontSize="small" /></IconButton></InputAdornment> : null,
                }}
              />
            </Grid>
            <Grid item xs={12} sm="auto">
              <FormControl sx={{ minWidth: 140 }} size="small">
                <InputLabel>Role</InputLabel>
                <Select value={roleFilter} label="Role" onChange={(e) => { setRoleFilter(e.target.value); setPage(0); }}
                  MenuProps={{ disablePortal: false, sx: { zIndex: 1300 } }}>
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="super_admin">Super Admin</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {isSuperAdminUser && (
              <Grid item xs={12} sm="auto">
                <FormControl sx={{ minWidth: 180 }} size="small">
                  <InputLabel>Institute</InputLabel>
                  <Select value={instituteFilter} label="Institute" onChange={(e) => { setInstituteFilter(e.target.value); setPage(0); }}
                    MenuProps={{ disablePortal: false, sx: { zIndex: 1300 } }}>
                    <MenuItem value="">All Institutes</MenuItem>
                    {institutes.map((inst) => (
                      <MenuItem key={inst.id} value={inst.id}>{inst.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}
          </Grid>
        </Box>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                {[
                  { id: 'name', label: 'Name' },
                  { id: 'email', label: 'Email' },
                  ...(isSuperAdminUser ? [{ id: 'institute_name', label: 'Institute' }] : []),
                  { id: 'role', label: 'Role' },
                  { id: 'status', label: 'Status' },
                  { id: 'created_at', label: 'Created' },
                ].map(({ id, label }) => (
                  <TableCell key={id} sx={{ fontWeight: 600 }}>
                    <TableSortLabel active={sort === id} direction={sort === id ? order.toLowerCase() : 'desc'} onClick={() => { const isAsc = sort === id && order === 'ASC'; setOrder(isAsc ? 'DESC' : 'ASC'); setSort(id); }}>{label}</TableSortLabel>
                  </TableCell>
                ))}
                <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            {isLoading ? (
              <TableBody>{Array.from({ length: rowsPerPage }).map((_, i) => (<TableRow key={i}>{Array.from({ length: isSuperAdminUser ? 7 : 6 }).map((_, j) => (<TableCell key={j}><Skeleton variant="text" width={j === 2 ? 160 : 80} /></TableCell>))}</TableRow>))}</TableBody>
            ) : (
              <TableBody>
                {items.length === 0 ? (
                  <TableRow><TableCell colSpan={isSuperAdminUser ? 7 : 6} align="center" sx={{ py: 6 }}><Typography color="text.secondary">No users found.</Typography></TableCell></TableRow>
                ) : items.map((user) => (
                  <TableRow key={user.id} hover sx={{ '&:last-child td': { border: 0 } }}>
                    <TableCell>
                      <Typography fontWeight={500}>
                        {user.name}
                        {isSelf(user.id) && <Chip label="You" size="small" color="info" sx={{ ml: 1, height: 20, fontSize: 11 }} />}
                      </Typography>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    {isSuperAdminUser && <TableCell>{user.institute_name || '-'}</TableCell>}
                    <TableCell><Chip label={user.role === 'super_admin' ? 'Super Admin' : 'Admin'} color={user.role === 'super_admin' ? 'primary' : 'default'} size="small" /></TableCell>
                    <TableCell>
                      <Tooltip title={!canToggle(user) ? (isSelf(user.id) ? 'Cannot toggle your own status' : 'Only super_admin can toggle super_admin status') : ''}>
                        <span>
                          <Chip
                            label={user.status}
                            color={user.status === 'active' ? 'success' : 'default'}
                            size="small"
                            onClick={() => { if (canToggle(user)) toggleMutation.mutate(user.id); }}
                            clickable={canToggle(user)}
                          />
                        </span>
                      </Tooltip>
                    </TableCell>
                    <TableCell>{formatDate(user.created_at)}</TableCell>
                    <TableCell align="right">
                      <Tooltip title={!canEdit(user) ? 'Only super_admin can edit super_admin accounts' : ''}>
                        <span>
                          <IconButton size="small" disabled={!canEdit(user)} onClick={() => navigate(`/users/${user.id}/edit`)}><Edit fontSize="small" /></IconButton>
                        </span>
                      </Tooltip>
                      <Tooltip title={!canDelete(user) ? (isSelf(user.id) ? 'Cannot delete your own account' : 'Only super_admin can delete super_admin accounts') : ''}>
                        <span>
                          <IconButton size="small" color="error" disabled={!canDelete(user)} onClick={() => setDeleteDialog({ open: true, id: user.id, name: user.name })}><Delete fontSize="small" /></IconButton>
                        </span>
                      </Tooltip>
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
        <DialogTitle>Delete User?</DialogTitle>
        <DialogContent><DialogContentText>Delete <strong>{deleteDialog.name}</strong>? Cannot undo.</DialogContentText></DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, id: null, name: '' })}>Cancel</Button>
          <Button onClick={() => { deleteMutation.mutate(deleteDialog.id); setDeleteDialog({ open: false, id: null, name: '' }); }} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
