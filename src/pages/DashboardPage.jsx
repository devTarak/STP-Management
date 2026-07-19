import { Navigate } from 'react-router-dom';
import { useState } from 'react';
import { Grid } from '@mui/material';
import { useAuth } from '@/hooks/useAuth';
import {
  useDashboardSummary,
  useDashboardRecentActivity,
  useDashboardRegistrationTrend,
} from '@/hooks/useDashboard';
import { WelcomeBanner } from '@/components/dashboard/WelcomeBanner';
import { StatCard } from '@/components/dashboard/StatCard';
import { StatCardSkeleton } from '@/components/dashboard/StatCardSkeleton';
import { RegistrationChart } from '@/components/dashboard/RegistrationChart';
import { RecentActivities } from '@/components/dashboard/RecentActivities';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import LayersIcon from '@mui/icons-material/Layers';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import { ROUTES } from '@/config/routes';

export default function DashboardPage() {
  const { user } = useAuth();

  if (user?.role === 'super_admin') {
    return <Navigate to={ROUTES.SUPER_ADMIN_DASHBOARD} replace />;
  }

  const [activityPage, setActivityPage] = useState(1);
  const activityPerPage = 8;

  const { data: summary, isLoading: summaryLoading } = useDashboardSummary();
  const { data: activityRes, isLoading: activityLoading } = useDashboardRecentActivity({ page: activityPage, per_page: activityPerPage });
  const { data: trendData, isLoading: trendLoading } = useDashboardRegistrationTrend();

  const activities = activityRes?.items ?? [];
  const activityTotal = activityRes?.total ?? 0;

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <WelcomeBanner userName={user?.name} userRole={user?.role} />
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        {summaryLoading ? (
          <StatCardSkeleton />
        ) : (
          <StatCard icon={MenuBookIcon} label="Total Courses" value={summary?.total_courses ?? 0} colorKey="courses" />
        )}
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        {summaryLoading ? (
          <StatCardSkeleton />
        ) : (
          <StatCard icon={LayersIcon} label="Total Batches" value={summary?.total_batches ?? 0} colorKey="batches" />
        )}
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        {summaryLoading ? (
          <StatCardSkeleton />
        ) : (
          <StatCard icon={CheckCircleIcon} label="Active Batches" value={summary?.active_batches ?? 0} colorKey="approved" />
        )}
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        {summaryLoading ? (
          <StatCardSkeleton />
        ) : (
          <StatCard icon={PendingActionsIcon} label="Pending Applications" value={summary?.applications?.pending ?? 0} colorKey="pending" />
        )}
      </Grid>

      <Grid item xs={12} md={7}>
        <RegistrationChart data={trendData} isLoading={trendLoading} />
      </Grid>
      <Grid item xs={12} md={5}>
        <RecentActivities
          data={activities}
          total={activityTotal}
          page={activityPage}
          perPage={activityPerPage}
          onPageChange={setActivityPage}
          isLoading={activityLoading}
        />
      </Grid>
    </Grid>
  );
}
