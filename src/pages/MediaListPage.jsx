import { useState } from 'react';
import {
  Box, Paper, Typography, Grid, Card, CardMedia, CardContent,
  CardActions, TextField, InputAdornment, IconButton, Stack,
  FormControl, InputLabel, Select, MenuItem, TablePagination,
  Dialog, DialogTitle, DialogContent, Tooltip, Chip, Skeleton,
} from '@mui/material';
import { Search, Clear, Image, InsertDriveFile, OpenInNew, Close } from '@mui/icons-material';
import { useMedia } from '@/hooks/useMedia';
import { formatDate } from '@/utils/helpers';

const typeOptions = [
  { value: '', label: 'All Types' },
  { value: 'jpg', label: 'JPEG' },
  { value: 'jpeg', label: 'JPEG' },
  { value: 'png', label: 'PNG' },
  { value: 'gif', label: 'GIF' },
  { value: 'webp', label: 'WebP' },
  { value: 'pdf', label: 'PDF' },
];

const rowsPerPageOptions = [12, 24, 48, 96];

function MediaSkeleton() {
  return (
    <Grid container spacing={2}>
      {Array.from({ length: 8 }).map((_, i) => (
        <Grid item xs={6} sm={4} md={3} key={i}>
          <Skeleton variant="rounded" height={200} />
        </Grid>
      ))}
    </Grid>
  );
}

export default function MediaListPage() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(12);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [previewItem, setPreviewItem] = useState(null);

  const params = { page: page + 1, per_page: rowsPerPage, search: search || undefined, type: typeFilter || undefined };
  const { data, isLoading } = useMedia(params);
  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  const handleSearch = (value) => {
    setSearchInput(value);
    clearTimeout(handleSearch._timer);
    handleSearch._timer = setTimeout(() => { setSearch(value); setPage(0); }, 400);
  };

  const isImage = (ext) => ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(ext);

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} mb={3}>Media Manager</Typography>

      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, mb: 3, overflow: 'visible' }}>
        <Box sx={{ p: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm>
              <TextField fullWidth size="small" placeholder="Search files..." value={searchInput}
                onChange={(e) => handleSearch(e.target.value)}
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
                <InputLabel>Type</InputLabel>
                <Select value={typeFilter} label="Type" onChange={(e) => { setTypeFilter(e.target.value); setPage(0); }}
                  MenuProps={{ disablePortal: false, sx: { zIndex: 1300 } }}>
                  {typeOptions.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {isLoading ? <MediaSkeleton /> : items.length === 0 ? (
        <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, p: 6, textAlign: 'center' }}>
          <Typography color="text.secondary">No media files found.</Typography>
        </Paper>
      ) : (
        <>
          <Grid container spacing={2}>
            {items.map((file) => (
              <Grid item xs={6} sm={4} md={3} key={file.path}>
                <Card
                  elevation={0}
                  sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, cursor: 'pointer', '&:hover': { borderColor: 'primary.main', boxShadow: 1 } }}
                  onClick={() => setPreviewItem(file)}
                >
                  {isImage(file.extension) ? (
                    <CardMedia component="img" height={160} image={file.url} alt={file.filename} sx={{ objectFit: 'cover' }} />
                  ) : (
                    <Box sx={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'grey.100' }}>
                      <InsertDriveFile sx={{ fontSize: 56, color: 'text.secondary' }} />
                    </Box>
                  )}
                  <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                    <Tooltip title={file.filename}>
                      <Typography variant="body2" fontWeight={500} noWrap>{file.filename}</Typography>
                    </Tooltip>
                    <Stack direction="row" spacing={1} alignItems="center" mt={0.5}>
                      <Chip label={file.extension.toUpperCase()} size="small" variant="outlined" sx={{ height: 20, fontSize: 11 }} />
                      <Typography variant="caption" color="text.secondary">{formatSize(file.size)}</Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <TablePagination
            component="div"
            count={total}
            page={page}
            onPageChange={(_, p) => setPage(p)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
            rowsPerPageOptions={rowsPerPageOptions}
            sx={{ mt: 2 }}
          />
        </>
      )}

      <Dialog open={!!previewItem} onClose={() => setPreviewItem(null)} maxWidth="md" fullWidth>
        {previewItem && (
          <>
            <DialogTitle>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Typography noWrap sx={{ maxWidth: 400 }}>{previewItem.filename}</Typography>
                <Stack direction="row" spacing={0.5}>
                  <Tooltip title="Open in new tab">
                    <IconButton component="a" href={previewItem.url} target="_blank"><OpenInNew /></IconButton>
                  </Tooltip>
                  <IconButton onClick={() => setPreviewItem(null)}><Close /></IconButton>
                </Stack>
              </Stack>
            </DialogTitle>
            <DialogContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400, flexDirection: 'column', gap: 2 }}>
              {isImage(previewItem.extension) ? (
                <Box component="img" src={previewItem.url} sx={{ maxWidth: '100%', maxHeight: '60vh', objectFit: 'contain', borderRadius: 1 }} />
              ) : (
                <Box component="iframe" src={previewItem.url} sx={{ width: '100%', height: '60vh', border: 'none' }} title="Preview" />
              )}
              <Box sx={{ width: '100%' }}>
                <Stack direction="row" spacing={3} justifyContent="center" flexWrap="wrap">
                  <Typography variant="body2" color="text.secondary">Size: {formatSize(previewItem.size)}</Typography>
                  <Typography variant="body2" color="text.secondary">Type: {previewItem.type}</Typography>
                  <Typography variant="body2" color="text.secondary">Modified: {formatDate(previewItem.modified_at)}</Typography>
                </Stack>
                <TextField
                  fullWidth size="small" label="File URL" value={previewItem.url}
                  sx={{ mt: 1.5 }}
                  slotProps={{ input: { readOnly: true } }}
                />
              </Box>
            </DialogContent>
          </>
        )}
      </Dialog>
    </Box>
  );
}
