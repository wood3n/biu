import React from 'react';
import { ThemeProvider as MUIThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#1fdf64',
    },
    secondary: {
      main: '#519BF4',
    },
    success: {
      main: '#1fdf64',
    },
  },
  shape: {
    borderRadius: 14,
  },
});

const ThemeProvider = ({ children }: React.PropsWithChildren) => (
  <MUIThemeProvider
    theme={theme}
  >
    <CssBaseline />
    {children}
  </MUIThemeProvider>
);

export default ThemeProvider;
