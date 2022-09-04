import React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, useRoutes } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import AuthProvider from './state/AuthProvider';
import routes from './routes';
import 'antd/dist/antd.css';

const Routes = () => useRoutes(routes);

const root = createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <HashRouter>
          <Routes />
        </HashRouter>
      </AuthProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
