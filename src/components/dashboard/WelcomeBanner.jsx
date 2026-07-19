import { Paper, Typography, Box } from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import { motion } from 'framer-motion';

export function WelcomeBanner({ userName, userRole }) {
  const isSuperAdmin = userRole === 'super_admin';

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 4,
          borderRadius: 3,
          background: isSuperAdmin
            ? 'linear-gradient(135deg, #1976d2 0%, #1565c0 50%, #0d47a1 100%)'
            : 'linear-gradient(135deg, #388e3c 0%, #2e7d32 50%, #1b5e20 100%)',
          color: '#fff',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
            Welcome back, {userName || 'User'}
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9, maxWidth: 600 }}>
            {isSuperAdmin
              ? 'You have full access to manage courses, batches, students, users, and system settings.'
              : 'You can manage student applications, courses, and batches.'}
          </Typography>
        </Box>
        <SchoolIcon
          sx={{
            position: 'absolute',
            right: -20,
            top: -20,
            fontSize: 200,
            opacity: 0.1,
          }}
        />
      </Paper>
    </motion.div>
  );
}
