import { Paper, Typography, Box, Skeleton, Avatar, List, ListItem, ListItemAvatar, ListItemText, Pagination } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import SchoolIcon from '@mui/icons-material/School';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { motion } from 'framer-motion';
import { formatDateTime } from '@/utils/helpers';

const actionConfig = {
  created: { icon: PersonIcon, color: '#1976d2', bg: '#e3f2fd' },
  updated: { icon: EditIcon, color: '#f57c00', bg: '#fff3e0' },
  deleted: { icon: DeleteIcon, color: '#c62828', bg: '#ffebee' },
  approved: { icon: CheckCircleIcon, color: '#2e7d32', bg: '#e8f5e9' },
  rejected: { icon: CancelIcon, color: '#c62828', bg: '#ffebee' },
};

function getActionConfig(action) {
  return actionConfig[action] || { icon: SchoolIcon, color: '#757575', bg: '#f5f5f5' };
}

function ActivityItem({ activity, index }) {
  const config = getActionConfig(activity.action);
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25, delay: index * 0.05 }}
    >
      <ListItem alignItems="flex-start" sx={{ px: 0, py: 1.5 }}>
        <ListItemAvatar>
          <Avatar sx={{ bgcolor: config.bg, width: 36, height: 36 }}>
            <Icon sx={{ fontSize: 18, color: config.color }} />
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          primary={
            <Typography variant="body2" fontWeight={500}>
              {activity.entity_name || activity.entity_type}
              <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                {activity.action}
              </Typography>
            </Typography>
          }
          secondary={
            <>
              <Typography variant="caption" color="text.secondary" display="block">
                {activity.user_name || 'System'}
              </Typography>
              <Typography variant="caption" color="text.disabled">
                {formatDateTime(activity.created_at)}
              </Typography>
            </>
          }
        />
      </ListItem>
    </motion.div>
  );
}

export function RecentActivities({ data, total, page, perPage, onPageChange, isLoading }) {
  if (isLoading) {
    return (
      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <Skeleton variant="text" width={160} height={28} />
        <Skeleton variant="text" width={100} height={20} sx={{ mb: 2 }} />
        {[...Array(5)].map((_, i) => (
          <Box key={i} sx={{ display: 'flex', gap: 2, py: 1.5 }}>
            <Skeleton variant="circular" width={36} height={36} />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width="60%" height={20} />
              <Skeleton variant="text" width="40%" height={16} />
            </Box>
          </Box>
        ))}
      </Paper>
    );
  }

  const lastPage = Math.max(1, Math.ceil(total / perPage));

  return (
    <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
      <Typography variant="h6" fontWeight={600} sx={{ mb: 0.5 }}>
        Recent Activities
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        Latest system activity
      </Typography>
      {(!data || data.length === 0) ? (
        <Typography variant="body2" color="text.disabled" sx={{ py: 4, textAlign: 'center' }}>
          No recent activities
        </Typography>
      ) : (
        <List disablePadding>
          {data.map((activity, index) => (
            <ActivityItem key={activity.id || index} activity={activity} index={index} />
          ))}
        </List>
      )}
      {total > perPage && (
        <Box sx={{ display: 'flex', justifyContent: 'center', pt: 2 }}>
          <Pagination count={lastPage} page={page} onChange={(_, p) => onPageChange(p)} color="primary" size="small" />
        </Box>
      )}
    </Paper>
  );
}
