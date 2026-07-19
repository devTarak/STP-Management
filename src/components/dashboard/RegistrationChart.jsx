import { Paper, Typography, Box, Skeleton } from '@mui/material';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        p: 1.5,
        borderRadius: 2,
        boxShadow: 3,
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      {payload.map((entry, i) => (
        <Typography key={i} variant="body2" fontWeight={600} sx={{ color: entry.color }}>
          {entry.name}: {entry.value}
        </Typography>
      ))}
    </Box>
  );
};

export function RegistrationChart({ data, isLoading }) {
  if (isLoading) {
    return (
      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <Skeleton variant="text" width={180} height={28} />
        <Skeleton variant="text" width={120} height={20} sx={{ mb: 2 }} />
        <Skeleton variant="rounded" height={280} />
      </Paper>
    );
  }

  const chartData = data?.trends || [];

  return (
    <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
      <Typography variant="h6" fontWeight={600} sx={{ mb: 0.5 }}>
        Registration Trend
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Monthly student registrations
      </Typography>
      <Box sx={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <defs>
              <linearGradient id="registrationGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1976d2" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#1976d2" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis dataKey="period" tick={{ fontSize: 12 }} stroke="#9e9e9e" />
            <YAxis tick={{ fontSize: 12 }} stroke="#9e9e9e" />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="count"
              name="Registrations"
              stroke="#1976d2"
              strokeWidth={2}
              fill="url(#registrationGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
}
