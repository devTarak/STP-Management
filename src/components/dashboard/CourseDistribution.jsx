import { Paper, Typography, Box, Skeleton } from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const COLORS = ['#1976d2', '#388e3c', '#f57c00', '#7b1fa2', '#00796b', '#c62828'];

const renderLegend = ({ payload }) => (
  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, justifyContent: 'center', mt: 2 }}>
    {payload.map((entry, index) => (
      <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: entry.color }} />
        <Typography variant="caption" color="text.secondary">
          {entry.value}
        </Typography>
      </Box>
    ))}
  </Box>
);

export function CourseDistribution({ data, isLoading }) {
  if (isLoading) {
    return (
      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <Skeleton variant="text" width={180} height={28} />
        <Skeleton variant="text" width={120} height={20} sx={{ mb: 2 }} />
        <Skeleton variant="rounded" height={280} />
      </Paper>
    );
  }

  const items = Array.isArray(data) ? data : [];

  const chartData = items.map((item) => ({
    name: item.course_name || item.name || 'Unknown',
    value: Number(item.total_applications) || Number(item.total) || Number(item.count) || 0,
  }));

  return (
    <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
      <Typography variant="h6" fontWeight={600} sx={{ mb: 0.5 }}>
        Course Distribution
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        Students per course
      </Typography>
      <Box sx={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={3}
              dataKey="value"
            >
              {chartData.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Legend content={renderLegend} />
          </PieChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
}
