import React from 'react';
import { ThemeProvider as MUIThemeProvider, createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#1abc9c',
      dark: '#1E1E1E',
    },
    secondary: {
      main: '#3498db',

    },
    success: {
      main: '#1abc9c',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiTab: {

    },
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
