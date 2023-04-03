import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter, useRoutes } from 'react-router-dom';
import { Alert } from 'antd';
import { Provider as JotaiProvider } from 'jotai';
import routes from './routes';
import ThemeProvider from './store/Provider/ThemeProvider';
import 'antd/dist/reset.css';
import 'simplebar-react/dist/simplebar.min.css';

const App = () => useRoutes(routes);

ReactDOM.render(
  <React.StrictMode>
    <JotaiProvider>
      <ThemeProvider>
        <Alert.ErrorBoundary>
          <HashRouter basename="/">
            <App />
          </HashRouter>
        </Alert.ErrorBoundary>
      </ThemeProvider>
    </JotaiProvider>
  </React.StrictMode>,
  document.getElementById('root'),
);
