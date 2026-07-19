import { Paper, Typography, Box } from '@mui/material';
import { motion } from 'framer-motion';

const iconBg = {
  students: { bg: '#e3f2fd', color: '#1976d2' },
  courses: { bg: '#e8f5e9', color: '#388e3c' },
  batches: { bg: '#fff3e0', color: '#f57c00' },
  users: { bg: '#f3e5f5', color: '#7b1fa2' },
  employees: { bg: '#e0f2f1', color: '#00796b' },
  approved: { bg: '#e8f5e9', color: '#2e7d32' },
  pending: { bg: '#fff8e1', color: '#f9a825' },
};

export function StatCard({ icon: Icon, label, value, colorKey = 'students', subtitle }) {
  const colors = iconBg[colorKey] || iconBg.students;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
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
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 2,
            bgcolor: colors.bg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Icon sx={{ color: colors.color, fontSize: 24 }} />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            {label}
          </Typography>
          <Typography variant="h4" fontWeight={700}>
            {value}
          </Typography>
          {subtitle && (
            <Typography variant="caption" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
      </Paper>
    </motion.div>
  );
}
