import React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, useRoutes } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import routes from './routes';
import './index.css';

const Routes = () => useRoutes(routes);

const root = createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <HashRouter>
        <Routes />
      </HashRouter>
    </ErrorBoundary>
  </React.StrictMode>
);
