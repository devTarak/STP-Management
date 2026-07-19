import { Paper, Skeleton, Box } from '@mui/material';

export function StatCardSkeleton() {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        height: '100%',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 3,
        display: 'flex',
        alignItems: 'flex-start',
        gap: 2,
      }}
    >
      <Skeleton variant="rounded" width={48} height={48} sx={{ borderRadius: 2 }} />
      <Box sx={{ flex: 1 }}>
        <Skeleton variant="text" width={80} height={20} />
        <Skeleton variant="text" width={60} height={36} />
      </Box>
    </Paper>
  );
}
