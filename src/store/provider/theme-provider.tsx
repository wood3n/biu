import React from 'react';
import { ThemeProvider as MUIThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const theme = createTheme({
  palette: {
    mode: 'dark',
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
