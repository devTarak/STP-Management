import { useState } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Tooltip,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import LockIcon from '@mui/icons-material/Lock';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import {
  Dashboard,
  School,
  Groups,
  Person,
  Badge,
  AdminPanelSettings,
  History,
  FileDownload,
  Receipt,
  Settings,
  Business,
  Assignment,
  AccountTree,
  Image,
} from '@mui/icons-material';
import { useAuth } from '@/hooks/useAuth';
import { getFilteredMenu } from '@/config/routes';
import ChangePasswordDialog from '@/components/auth/ChangePasswordDialog';

const iconMap = {
  Dashboard,
  School,
  Groups,
  Person,
  Badge,
  AdminPanelSettings,
  History,
  FileDownload,
  Receipt,
  Settings,
  Business,
  Assignment,
  AccountTree,
  Image,
};

const DRAWER_WIDTH = 260;

export function MainLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const role = user?.role || 'admin';
  const menuSections = getFilteredMenu(role);

  const handleLogout = async () => {
    setAnchorEl(null);
    await logout();
    navigate('/login');
  };

  const getPageTitle = () => {
    for (const section of menuSections) {
      for (const item of section.items) {
        if (
          location.pathname === item.path ||
          (item.path !== '/dashboard' && location.pathname.startsWith(item.path + '/'))
        ) {
          return item.label;
        }
      }
    }
    return 'Dashboard';
  };

  const drawerContent = (
    <Box>
      <Toolbar>
        <Typography variant="h6" noWrap fontWeight={700}>
          STP Management
        </Typography>
      </Toolbar>
      <Divider />
      {menuSections.map((section) => (
        <Box key={section.label}>
          <Typography
            variant="caption"
            sx={{
              px: 3,
              pt: 2,
              pb: 0.5,
              display: 'block',
              color: 'text.disabled',
              fontWeight: 600,
              letterSpacing: 1,
              textTransform: 'uppercase',
              fontSize: '0.7rem',
            }}
          >
            {section.label}
          </Typography>
          <List dense disablePadding>
            {section.items.map((item) => {
              const Icon = iconMap[item.icon];
              const selected =
                location.pathname === item.path ||
                (item.path !== '/dashboard' &&
                  location.pathname.startsWith(item.path + '/'));
              return (
                <ListItem key={item.path} disablePadding>
                  <ListItemButton
                    selected={selected}
                    onClick={() => {
                      navigate(item.path);
                      setMobileOpen(false);
                    }}
                    sx={{ mx: 1, borderRadius: 1, py: 0.8 }}
                  >
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <Icon
                        fontSize="small"
                        color={selected ? 'primary' : 'inherit'}
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{
                        fontSize: '0.875rem',
                        fontWeight: selected ? 600 : 400,
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
          <Divider sx={{ mt: 1 }} />
        </Box>
      ))}
    </Box>
  );

  return (
    <Box display="flex">
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          bgcolor: 'background.paper',
          color: 'text.primary',
        }}
      >
        <Toolbar>
          <IconButton
            edge="start"
            onClick={() => setMobileOpen(!mobileOpen)}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
            {getPageTitle()}
          </Typography>
          {user?.institute_slug && (
            <Tooltip title="View Public Page">
              <IconButton
                component={Link}
                to={`/stp/${user.institute_slug}`}
                target="_blank"
                rel="noopener"
                sx={{ mr: 1 }}
              >
                <OpenInNewIcon />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title={user?.name || 'User'}>
            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                {(user?.name || 'U').charAt(0).toUpperCase()}
              </Avatar>
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          >
            <MenuItem disabled>
              <Typography variant="body2" color="text.secondary">
                {user?.name} ({user?.role})
              </Typography>
            </MenuItem>
            {user?.institute_slug && (
              <MenuItem
                onClick={() => {
                  setAnchorEl(null);
                  window.open(`/stp/${user.institute_slug}`, '_blank');
                }}
              >
                <OpenInNewIcon fontSize="small" sx={{ mr: 1 }} />
                View Public Page
              </MenuItem>
            )}
            <MenuItem onClick={() => { setAnchorEl(null); setChangePasswordOpen(true); }}>
              <LockIcon fontSize="small" sx={{ mr: 1 }} />
              Change Password
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { width: DRAWER_WIDTH },
          }}
        >
          {drawerContent}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { width: DRAWER_WIDTH },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: 8,
          minHeight: 'calc(100vh - 64px)',
          bgcolor: 'background.default',
        }}
      >
        <Outlet />
      </Box>
      <ChangePasswordDialog open={changePasswordOpen} onClose={() => setChangePasswordOpen(false)} />
    </Box>
  );
}
