import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/providers/AuthProvider';
import { MainLayout } from '@/components/layout/MainLayout';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { ROUTES } from '@/config/routes';
import { Box, CircularProgress } from '@mui/material';

const LoginPage = lazy(() => import('@/pages/LoginPage'));
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const StudentsListPage = lazy(() => import('@/pages/StudentsListPage'));
const StudentViewPage = lazy(() => import('@/pages/StudentViewPage'));
const StudentEditPage = lazy(() => import('@/pages/StudentEditPage'));
const PublicRegistrationPage = lazy(() => import('@/pages/PublicRegistrationPage'));
const PrintPage = lazy(() => import('@/pages/PrintPage'));
const CourseListPage = lazy(() => import('@/pages/CourseListPage'));
const CourseCreatePage = lazy(() => import('@/pages/CourseCreatePage'));
const CourseEditPage = lazy(() => import('@/pages/CourseEditPage'));
const BatchListPage = lazy(() => import('@/pages/BatchListPage'));
const BatchCreatePage = lazy(() => import('@/pages/BatchCreatePage'));
const BatchEditPage = lazy(() => import('@/pages/BatchEditPage'));
const ApplicationsListPage = lazy(() => import('@/pages/ApplicationsListPage'));
const AssessorBillPage = lazy(() => import('@/pages/AssessorBillPage'));
const UserListPage = lazy(() => import('@/pages/UserListPage'));
const UserCreatePage = lazy(() => import('@/pages/UserCreatePage'));
const UserEditPage = lazy(() => import('@/pages/UserEditPage'));
const InstituteListPage = lazy(() => import('@/pages/InstituteListPage'));
const InstituteCreatePage = lazy(() => import('@/pages/InstituteCreatePage'));
const InstituteEditPage = lazy(() => import('@/pages/InstituteEditPage'));
const InstituteOverviewPage = lazy(() => import('@/pages/InstituteOverviewPage'));
const ActivityLogPage = lazy(() => import('@/pages/ActivityLogPage'));
const MediaListPage = lazy(() => import('@/pages/MediaListPage'));
const SiteSettingsPage = lazy(() => import('@/pages/SiteSettingsPage'));
const SuperAdminDashboardPage = lazy(() => import('@/pages/SuperAdminDashboardPage'));
const InstitutePublicPage = lazy(() => import('@/pages/InstitutePublicPage'));

function PageLoader() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <CircularProgress />
    </Box>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/stp/:instituteTitle/register" element={<PublicRegistrationPage />} />
              <Route path={ROUTES.INSTITUTE_PUBLIC} element={<InstitutePublicPage />} />

              <Route element={<AuthLayout />}>
                <Route path={ROUTES.LOGIN} element={<LoginPage />} />
              </Route>

              <Route
                element={
                  <ProtectedRoute>
                    <MainLayout />
                  </ProtectedRoute>
                }
              >
                <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
                <Route path={ROUTES.SUPER_ADMIN_DASHBOARD} element={<ProtectedRoute roles={['super_admin']}><SuperAdminDashboardPage /></ProtectedRoute>} />

                <Route path={ROUTES.STUDENTS} element={<ProtectedRoute roles={['admin']}><StudentsListPage /></ProtectedRoute>} />
                <Route path={ROUTES.STUDENT_VIEW} element={<ProtectedRoute roles={['admin']}><StudentViewPage /></ProtectedRoute>} />
                <Route path={ROUTES.STUDENT_EDIT} element={<ProtectedRoute roles={['admin']}><StudentEditPage /></ProtectedRoute>} />

                <Route path={ROUTES.COURSES} element={<ProtectedRoute roles={['admin']}><CourseListPage /></ProtectedRoute>} />
                <Route path={ROUTES.COURSE_CREATE} element={<ProtectedRoute roles={['admin']}><CourseCreatePage /></ProtectedRoute>} />
                <Route path={ROUTES.COURSE_EDIT} element={<ProtectedRoute roles={['admin']}><CourseEditPage /></ProtectedRoute>} />
                <Route path={ROUTES.BATCHES} element={<ProtectedRoute roles={['admin']}><BatchListPage /></ProtectedRoute>} />
                <Route path={ROUTES.BATCH_CREATE} element={<ProtectedRoute roles={['admin']}><BatchCreatePage /></ProtectedRoute>} />
                <Route path={ROUTES.BATCH_EDIT} element={<ProtectedRoute roles={['admin']}><BatchEditPage /></ProtectedRoute>} />
                <Route path={ROUTES.APPLICATIONS} element={<ProtectedRoute roles={['admin']}><ApplicationsListPage /></ProtectedRoute>} />
                <Route path={ROUTES.ASSESSOR_BILL} element={<ProtectedRoute roles={['admin']}><AssessorBillPage /></ProtectedRoute>} />

                <Route path={ROUTES.USERS} element={<ProtectedRoute roles={['super_admin']}><UserListPage /></ProtectedRoute>} />
                <Route path={ROUTES.USER_CREATE} element={<ProtectedRoute roles={['super_admin']}><UserCreatePage /></ProtectedRoute>} />
                <Route path={ROUTES.USER_EDIT} element={<ProtectedRoute roles={['super_admin']}><UserEditPage /></ProtectedRoute>} />
                <Route path={ROUTES.INSTITUTE} element={<ProtectedRoute roles={['super_admin']}><InstituteOverviewPage /></ProtectedRoute>} />
                <Route path={ROUTES.INSTITUTES} element={<ProtectedRoute roles={['super_admin']}><InstituteListPage /></ProtectedRoute>} />
                <Route path={ROUTES.INSTITUTES + '/create'} element={<ProtectedRoute roles={['super_admin']}><InstituteCreatePage /></ProtectedRoute>} />
                <Route path={ROUTES.INSTITUTES + '/:id/edit'} element={<ProtectedRoute roles={['super_admin']}><InstituteEditPage /></ProtectedRoute>} />
                <Route path={ROUTES.ACTIVITY_LOGS} element={<ProtectedRoute roles={['super_admin']}><ActivityLogPage /></ProtectedRoute>} />
                <Route path={ROUTES.MEDIA} element={<ProtectedRoute roles={['super_admin']}><MediaListPage /></ProtectedRoute>} />
                <Route path={ROUTES.SITE_SETTINGS} element={<ProtectedRoute roles={['admin']}><SiteSettingsPage /></ProtectedRoute>} />
              </Route>

              <Route path={ROUTES.PRINT} element={<PrintPage />} />
              <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
            </Routes>
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
