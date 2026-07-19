import { useState } from 'react';
import {
  Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, TablePagination, TableSortLabel, Typography, Stack, Chip, Skeleton,
} from '@mui/material';
import { useActivityLogs } from '@/hooks/useActivityLogs';
import { formatDateTime } from '@/utils/helpers';

const rowsPerPageOptions = [10, 25, 50, 100];

const actionColors = {
  created: 'success', updated: 'info', deleted: 'error', approved: 'primary', rejected: 'warning',
};

export default function ActivityLogPage() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sort, setSort] = useState('created_at');
  const [order, setOrder] = useState('DESC');

  const params = { page: page + 1, per_page: rowsPerPage, sort, order };
  const { data, isLoading } = useActivityLogs(params);
  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} mb={3}>Activity Logs</Typography>

      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                {[{ id: 'action', label: 'Action' }, { id: 'entity_type', label: 'Entity' }, { id: 'entity_name', label: 'Details' }, { id: 'user_name', label: 'User' }, { id: 'created_at', label: 'Timestamp' }].map(({ id, label }) => (
                  <TableCell key={id} sx={{ fontWeight: 600 }}>
                    <TableSortLabel active={sort === id} direction={sort === id ? order.toLowerCase() : 'desc'} onClick={() => { const isAsc = sort === id && order === 'ASC'; setOrder(isAsc ? 'DESC' : 'ASC'); setSort(id); }}>{label}</TableSortLabel>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            {isLoading ? (
              <TableBody>{Array.from({ length: rowsPerPage }).map((_, i) => (<TableRow key={i}>{Array.from({ length: 5 }).map((_, j) => (<TableCell key={j}><Skeleton variant="text" width={j === 3 ? 120 : 80} /></TableCell>))}</TableRow>))}</TableBody>
            ) : (
              <TableBody>
                {items.length === 0 ? (
                  <TableRow><TableCell colSpan={5} align="center" sx={{ py: 6 }}><Typography color="text.secondary">No activity logs found.</Typography></TableCell></TableRow>
                ) : items.map((log) => (
                  <TableRow key={log.id} hover sx={{ '&:last-child td': { border: 0 } }}>
                    <TableCell>
                      <Chip label={log.action} color={actionColors[log.action] || 'default'} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell sx={{ textTransform: 'capitalize' }}>{log.entity_type}</TableCell>
                    <TableCell>
                      <Typography variant="body2">{log.entity_name || `#${log.entity_id}`}</Typography>
                      {log.details && <Typography variant="caption" color="text.secondary">{log.details}</Typography>}
                    </TableCell>
                    <TableCell>{log.user_name || 'System'}</TableCell>
                    <TableCell><Typography variant="body2">{formatDateTime(log.created_at)}</Typography></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            )}
          </Table>
        </TableContainer>

        <TablePagination component="div" count={total} page={page} onPageChange={(_, p) => setPage(p)} rowsPerPage={rowsPerPage} onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }} rowsPerPageOptions={rowsPerPageOptions} />
      </Paper>
    </Box>
  );
}
