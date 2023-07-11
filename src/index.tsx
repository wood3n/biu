import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter, useRoutes } from 'react-router-dom';
import routes from './routes';
import ThemeProvider from './store/provider/theme-provider';
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
