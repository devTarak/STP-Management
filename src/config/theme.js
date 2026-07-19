import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#9c27b0',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: 'none',
        },
      },
    },
    MuiSelect: {
      defaultProps: {
        MenuProps: {
          disablePortal: false,
          sx: { zIndex: 1300 },
        },
      },
    },
    MuiAutocomplete: {
      defaultProps: {
        disablePortal: false,
      },
      styleOverrides: {
        popper: {
          zIndex: 1300,
        },
      },
    },
    MuiMenu: {
      defaultProps: {
        disablePortal: false,
      },
      styleOverrides: {
        root: {
          zIndex: 1300,
        },
      },
    },
    MuiPopover: {
      defaultProps: {
        disablePortal: false,
      },
      styleOverrides: {
        root: {
          zIndex: 1300,
        },
      },
    },
  },
});

export default theme;
