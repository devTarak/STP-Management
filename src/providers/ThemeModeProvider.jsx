import { createContext, useState, useMemo } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import baseTheme from '@/config/theme';

export const ThemeModeContext = createContext({ toggleMode: () => {} });

export function ThemeModeProvider({ children }) {
  const [mode, setMode] = useState('light');

  const value = useMemo(
    () => ({
      toggleMode: () => setMode((prev) => (prev === 'light' ? 'dark' : 'light')),
    }),
    [],
  );

  const currentTheme = useMemo(
    () => createTheme({ ...baseTheme, palette: { ...baseTheme.palette, mode } }),
    [mode],
  );

  return (
    <ThemeModeContext.Provider value={value}>
      <MuiThemeProvider theme={currentTheme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeModeContext.Provider>
  );
}
