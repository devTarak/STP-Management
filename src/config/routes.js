export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  COURSES: '/courses',
  COURSE_CREATE: '/courses/create',
  COURSE_EDIT: '/courses/:id/edit',
  BATCHES: '/batches',
  BATCH_CREATE: '/batches/create',
  BATCH_EDIT: '/batches/:id/edit',
  STUDENTS: '/students',
  STUDENT_VIEW: '/students/:id',
  STUDENT_EDIT: '/students/:id/edit',
  APPLICATIONS: '/applications',
  ASSESSOR_BILL: '/assessor-bill',
  USERS: '/users',
  USER_CREATE: '/users/create',
  USER_EDIT: '/users/:id/edit',
  INSTITUTE: '/institute',
  INSTITUTES: '/institutes',
  ACTIVITY_LOGS: '/activity-logs',
  MEDIA: '/media',
  SITE_SETTINGS: '/settings',
  SUPER_ADMIN_DASHBOARD: '/super-admin/dashboard',
  INSTITUTE_PUBLIC: '/stp/:slug',
};

export const menuSections = [
  {
    label: 'Overview',
    items: [
      { label: 'Dashboard', path: ROUTES.SUPER_ADMIN_DASHBOARD, icon: 'Dashboard', roles: ['super_admin'] },
      { label: 'Dashboard', path: ROUTES.DASHBOARD, icon: 'Dashboard', roles: ['admin'] },
    ],
  },
  {
    label: 'Academic',
    roles: ['admin'],
    items: [
      { label: 'Courses', path: ROUTES.COURSES, icon: 'School', roles: ['admin'] },
      { label: 'Batches', path: ROUTES.BATCHES, icon: 'Groups', roles: ['admin'] },
      { label: 'Students', path: ROUTES.STUDENTS, icon: 'Person', roles: ['admin'] },
      { label: 'Applications', path: ROUTES.APPLICATIONS, icon: 'Assignment', roles: ['admin'] },
      { label: 'Assessor Bill', path: ROUTES.ASSESSOR_BILL, icon: 'Receipt', roles: ['admin'] },
      { label: 'Site Settings', path: ROUTES.SITE_SETTINGS, icon: 'Settings', roles: ['admin'] },
    ],
  },
  {
    label: 'Administration',
    roles: ['super_admin'],
    items: [
      { label: 'User Management', path: ROUTES.USERS, icon: 'AdminPanelSettings', roles: ['super_admin'] },
    ],
  },
  {
    label: 'Institute',
    roles: ['super_admin'],
    items: [
      { label: 'Institute Overview', path: ROUTES.INSTITUTE, icon: 'Business', roles: ['super_admin'] },
      { label: 'Institute Management', path: ROUTES.INSTITUTES, icon: 'AccountTree', roles: ['super_admin'] },
    ],
  },
  {
    label: 'System',
    roles: ['super_admin'],
    items: [
      { label: 'Activity Logs', path: ROUTES.ACTIVITY_LOGS, icon: 'History', roles: ['super_admin'] },
      { label: 'Media Manager', path: ROUTES.MEDIA, icon: 'Image', roles: ['super_admin'] },
    ],
  },
];

export function getFilteredMenu(userRole) {
  return menuSections
    .map((section) => {
      const sectionRole = section.roles;
      if (sectionRole && !sectionRole.includes(userRole)) {
        return null;
      }
      return {
        ...section,
        items: section.items.filter((item) => item.roles.includes(userRole)),
      };
    })
    .filter(Boolean);
}
