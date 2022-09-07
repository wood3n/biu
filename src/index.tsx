import React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, useRoutes } from 'react-router-dom';
import { Alert } from 'antd';
import AuthProvider from './state/AuthProvider';
import routes from './routes';
import 'antd/dist/antd.css';

const Routes = () => useRoutes(routes);

const root = createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <Alert.ErrorBoundary>
      <AuthProvider>
        <HashRouter basename='/'>
          <Routes />
        </HashRouter>
      </AuthProvider>
    </Alert.ErrorBoundary>
  </React.StrictMode>
);
