import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter, useRoutes } from 'react-router-dom';
import routes from './routes';
import ThemeProvider from './store/Provider/ThemeProvider';
// import 'antd/dist/reset.css';
import 'simplebar-react/dist/simplebar.min.css';

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
