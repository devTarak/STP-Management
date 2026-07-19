import { Grid } from '@mui/material';
import { useAuth } from '@/hooks/useAuth';
import { useSuperAdminDashboardSummary } from '@/hooks/useSuperAdminDashboard';
import { WelcomeBanner } from '@/components/dashboard/WelcomeBanner';
import { StatCard } from '@/components/dashboard/StatCard';
import { StatCardSkeleton } from '@/components/dashboard/StatCardSkeleton';
import BusinessIcon from '@mui/icons-material/Business';
import PeopleIcon from '@mui/icons-material/People';
import SchoolIcon from '@mui/icons-material/School';

export default function SuperAdminDashboardPage() {
  const { user } = useAuth();
  const { data: summary, isLoading } = useSuperAdminDashboardSummary();

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <WelcomeBanner userName={user?.name} userRole={user?.role} />
      </Grid>

      {isLoading ? (
        <>
          {[...Array(3)].map((_, i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <StatCardSkeleton />
            </Grid>
          ))}
        </>
      ) : (
        <>
          <Grid item xs={12} sm={6} md={4}>
            <StatCard icon={BusinessIcon} label="Total Institutes" value={summary?.total_institutes ?? 0} colorKey="courses" />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <StatCard icon={SchoolIcon} label="Active Institutes" value={summary?.active_institutes ?? 0} colorKey="approved" />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <StatCard icon={PeopleIcon} label="Total Users" value={summary?.total_users ?? 0} colorKey="batches" />
          </Grid>
        </>
      )}
    </Grid>
  );
}
