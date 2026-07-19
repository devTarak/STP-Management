import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, TablePagination, TableSortLabel, TextField, InputAdornment,
  Select, MenuItem, FormControl, InputLabel, Chip, IconButton,
  Typography, Button, Tooltip, Dialog, DialogTitle, DialogContent,
  DialogContentText, DialogActions, Stack, Grid, Menu, ListItemIcon,
  Autocomplete, Avatar, Skeleton,
} from '@mui/material';
import {
  Search, Visibility, Edit, Delete, FilterList, MoreVert,
  CheckCircle, Cancel, Add, Clear, Download,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useStudents, useDeleteStudent, useUpdateStudentStatus } from '@/hooks/useStudents';
import RejectDialog from '@/components/common/RejectDialog';
import { useBatches } from '@/hooks/useBatches';
import { useAuth } from '@/hooks/useAuth';
import { studentService } from '@/services/studentService';
import { formatDate, getStatusColor } from '@/utils/helpers';
import toast from 'react-hot-toast';

const statusFilters = [
  { value: '', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

const genderFilters = [
  { value: '', label: 'All Genders' },
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
];

const rowsPerPageOptions = [10, 25, 50, 100];

function TableSkeleton({ rows }) {
  return (
    <TableBody>
      {Array.from({ length: rows }).map((_, i) => (
        <TableRow key={i}>
          {Array.from({ length: 7 }).map((_, j) => (
            <TableCell key={j}>
              <Skeleton variant="text" width={j === 1 ? 140 : 80} />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </TableBody>
  );
}

function StatusChip({ status }) {
  const color = getStatusColor(status);
  return (
    <Chip
      label={status ? status.charAt(0).toUpperCase() + status.slice(1) : '-'}
      color={color}
      size="small"
      variant={status === 'pending' ? 'outlined' : 'filled'}
    />
  );
}

function ActionMenu({ student, onView, onEdit, onDelete, onStatus, anchorEl, onClose, isSuperAdmin }) {
  return (
    <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={onClose} onClick={onClose}>
      <MenuItem onClick={() => onView(student.id)}>
        <ListItemIcon><Visibility fontSize="small" /></ListItemIcon>
        View
      </MenuItem>
      <MenuItem onClick={() => onEdit(student.id)}>
        <ListItemIcon><Edit fontSize="small" /></ListItemIcon>
        Edit
      </MenuItem>
      {isSuperAdmin && student.status === 'pending' && (
        [
          <MenuItem key="approve" onClick={() => onStatus(student.id, 'approved')}>
            <ListItemIcon><CheckCircle fontSize="small" color="success" /></ListItemIcon>
            Approve
          </MenuItem>,
          <MenuItem key="reject" onClick={() => onStatus(student.id, 'rejected')}>
            <ListItemIcon><Cancel fontSize="small" color="error" /></ListItemIcon>
            Reject
          </MenuItem>,
        ]
      )}
      <MenuItem onClick={() => onDelete(student.id)}>
        <ListItemIcon><Delete fontSize="small" color="error" /></ListItemIcon>
        <Typography color="error">Delete</Typography>
      </MenuItem>
    </Menu>
  );
}

export default function StudentsListPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'super_admin';

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [filters, setFilters] = useState({ status: isSuperAdmin ? '' : 'approved', gender: '' });
  const [batchFilter, setBatchFilter] = useState(null);
  const [batchKey, setBatchKey] = useState(0);
  const [sort, setSort] = useState('id');
  const [order, setOrder] = useState('DESC');
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null });
  const [rejectDialog, setRejectDialog] = useState({ open: false, student: null });
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [downloading, setDownloading] = useState(false);

  const params = {
    page: page + 1,
    per_page: rowsPerPage,
    search,
    sort,
    order,
    ...filters,
    batch_id: batchFilter?.id ?? undefined,
  };

  const { data, isLoading } = useStudents(params);
  const { data: batchesData } = useBatches({ per_page: 200, sort: 'name', order: 'ASC' });
  const batches = batchesData?.items ?? [];
  const deleteMutation = useDeleteStudent();
  const statusMutation = useUpdateStudentStatus();

  const students = data?.items ?? [];
  const total = data?.total ?? 0;

  const searchTimeout = useCallback((() => {
    let timer;
    return (value) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        setSearch(value);
        setPage(0);
      }, 400);
    };
  })(), []);

  const handleSearchChange = (e) => {
    setSearchInput(e.target.value);
    searchTimeout(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setSearch('');
    setPage(0);
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
    setPage(0);
  };

  const handleSort = (field) => {
    const isAsc = sort === field && order === 'ASC';
    setOrder(isAsc ? 'DESC' : 'ASC');
    setSort(field);
  };

  const handleChangePage = (_, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDelete = (id) => setDeleteDialog({ open: true, id });
  const confirmDelete = () => {
    deleteMutation.mutate(deleteDialog.id);
    setDeleteDialog({ open: false, id: null });
  };

  const handleStatus = (id, status) => {
    if (status === 'rejected') {
      const student = students.find((s) => s.id === id);
      setRejectDialog({ open: true, student: student ?? null });
      return;
    }
    statusMutation.mutate({ id, data: { status } });
  };

  const handleMenuOpen = (event, student) => {
    setMenuAnchor(event.currentTarget);
    setSelectedStudent(student);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedStudent(null);
  };

  const handleExportCsv = async () => {
    if (!batchFilter) return;
    setDownloading(true);
    try {
      const blob = await studentService.exportCsv(batchFilter.id, filters.status || 'all');
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `applicants_${batchFilter.name.replace(/\s+/g, '_')}_${filters.status || 'all'}_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error('Failed to export CSV.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={700}>
          Students
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {total} total
        </Typography>
      </Stack>

      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, mb: 3, overflow: 'visible' }}>
        <Box sx={{ p: 2, pb: 0 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm>
              <TextField
                fullWidth
                size="small"
                placeholder="Search by name, ref no, contact..."
                value={searchInput}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start"><Search fontSize="small" /></InputAdornment>
                  ),
                  endAdornment: searchInput ? (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={handleClearSearch}><Clear fontSize="small" /></IconButton>
                    </InputAdornment>
                  ) : null,
                }}
              />
            </Grid>
            {isSuperAdmin && (
              <Grid item xs={12} sm="auto">
                <FormControl sx={{ minWidth: 140 }} size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filters.status}
                    label="Status"
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    MenuProps={{ disablePortal: false, sx: { zIndex: 1300 } }}
                  >
                    {statusFilters.map((opt) => (
                      <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}
            <Grid item xs={12} sm="auto">
              <FormControl sx={{ minWidth: 120 }} size="small">
                <InputLabel>Gender</InputLabel>
                <Select
                  value={filters.gender}
                  label="Gender"
                  onChange={(e) => handleFilterChange('gender', e.target.value)}
                  MenuProps={{ disablePortal: false, sx: { zIndex: 1300 } }}
                >
                  {genderFilters.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                  ))}
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
            <Grid item xs={12} sm="auto">
              <Button
                size="small"
                variant="contained"
                color="primary"
                startIcon={<Download />}
                disabled={!batchFilter || downloading}
                onClick={handleExportCsv}
              >
                {downloading ? 'Downloading...' : 'Download CSV'}
              </Button>
            </Grid>
            {(filters.gender || batchFilter) && (
              <Grid item xs={12} sm="auto">
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<Clear />}
                  onClick={() => { setFilters({ status: isSuperAdmin ? '' : 'approved', gender: '' }); setBatchFilter(null); setBatchKey((k) => k + 1); setPage(0); }}
                >
                  Clear Filters
                </Button>
              </Grid>
            )}
          </Grid>
        </Box>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>
                  <TableSortLabel
                    active={sort === 'ref_no'}
                    direction={sort === 'ref_no' ? order.toLowerCase() : 'desc'}
                    onClick={() => handleSort('ref_no')}
                  >
                    Ref No
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ fontWeight: 600 }}>
                  <TableSortLabel
                    active={sort === 'name_en'}
                    direction={sort === 'name_en' ? order.toLowerCase() : 'desc'}
                    onClick={() => handleSort('name_en')}
                  >
                    Name
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Contact</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Course / Batch</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Gender</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>
                  <TableSortLabel
                    active={sort === 'status'}
                    direction={sort === 'status' ? order.toLowerCase() : 'desc'}
                    onClick={() => handleSort('status')}
                  >
                    Status
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            {isLoading ? (
              <TableSkeleton rows={rowsPerPage} />
            ) : (
              <TableBody>
                {students.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                      <Typography color="text.secondary">No students found.</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  students.map((student) => (
                    <TableRow
                      key={student.id}
                      hover
                      sx={{ cursor: 'pointer', '&:last-child td': { border: 0 } }}
                      onClick={() => navigate(`/students/${student.id}`)}
                    >
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {student.ref_no || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1.5}>
                          <Avatar
                            src={student.photo_url}
                            sx={{ width: 32, height: 32, bgcolor: 'primary.light', fontSize: 13 }}
                          >
                            {student.name_en?.charAt(0)?.toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={500}>
                              {student.name_en || 'N/A'}
                            </Typography>
                            {student.name_bn && (
                              <Typography variant="caption" color="text.secondary">
                                {student.name_bn}
                              </Typography>
                            )}
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{student.contact_no || '-'}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {student.course_name || student.course_id || '-'}
                        </Typography>
                        {student.batch_name && (
                          <Typography variant="caption" color="text.secondary">
                            {student.batch_name}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                          {student.gender || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <StatusChip status={student.status} />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMenuOpen(e, student);
                          }}
                        >
                          <MoreVert fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            )}
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={rowsPerPageOptions}
        />
      </Paper>

      <ActionMenu
        student={selectedStudent}
        anchorEl={menuAnchor}
        onClose={handleMenuClose}
        onView={(id) => { navigate(`/students/${id}`); }}
        onEdit={(id) => { navigate(`/students/${id}/edit`); }}
        onDelete={handleDelete}
        onStatus={handleStatus}
        isSuperAdmin={isSuperAdmin}
      />

      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, id: null })}>
        <DialogTitle>Delete Student?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This action cannot be undone. Only pending applications can be deleted.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, id: null })}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

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
