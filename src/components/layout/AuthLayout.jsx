import { Outlet } from 'react-router-dom';
import { Box, Paper, Typography } from '@mui/material';

export function AuthLayout() {
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      bgcolor="background.default"
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          width: '100%',
          maxWidth: 420,
          mx: 2,
        }}
      >
        <Typography variant="h5" align="center" gutterBottom fontWeight={600}>
          STP Management
        </Typography>
        <Outlet />
      </Paper>
    </Box>
  );
}
