import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter, useRoutes } from 'react-router-dom';
import routes from './routes';
import ThemeProvider from './store/provider/theme-provider';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import '@/common/style/global.less';

const App = () => useRoutes(routes);

ReactDOM.render(
  <React.StrictMode>
    <HashRouter basename="/">
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </HashRouter>
  </React.StrictMode>,
  document.getElementById('root'),
);
