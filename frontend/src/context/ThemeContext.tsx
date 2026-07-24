import React, { createContext, useContext, useState, useMemo } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme, CssBaseline, PaletteMode } from '@mui/material';

interface ThemeContextType {
  mode: PaletteMode;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const CustomThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<PaletteMode>('light');

  const toggleTheme = () => {
    setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: '#0078D4', // Microsoft Blue
            light: '#2B88D8',
            dark: '#005A9E',
          },
          secondary: {
            main: '#008272', // Teal
          },
          background: {
            default: mode === 'light' ? '#F3F2F1' : '#1B1A19',
            paper: mode === 'light' ? '#FFFFFF' : '#252423',
          },
          text: {
            primary: mode === 'light' ? '#201F1E' : '#F3F2F1',
            secondary: mode === 'light' ? '#605E5C' : '#A19F9D',
          },
        },
        typography: {
          fontFamily: '"Inter", "Segoe UI", "Helvetica Neue", sans-serif',
          h4: { fontWeight: 600 },
          h6: { fontWeight: 600 },
        },
        shape: { borderRadius: 8 },
        components: {
          MuiPaper: {
            styleOverrides: {
              root: {
                boxShadow: mode === 'light'
                  ? '0px 1.6px 3.6px rgba(0, 0, 0, 0.13), 0px 0.3px 0.9px rgba(0, 0, 0, 0.11)'
                  : '0px 1.6px 3.6px rgba(0, 0, 0, 0.4)',
              },
            },
          },
          MuiButton: {
            styleOverrides: {
              root: {
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: 6,
              },
            },
          },
        },
      }),
    [mode]
  );

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useCustomTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useCustomTheme must be used within CustomThemeProvider');
  }
  return context;
};
