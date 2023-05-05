import React from 'react';
import { ThemeProvider as MUIThemeProvider, createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
  },
});

const ThemeProvider = ({ children }: React.PropsWithChildren) => (
  <MUIThemeProvider
    theme={theme}
  >
    {children}
  </MUIThemeProvider>
);

export default ThemeProvider;
