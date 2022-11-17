import React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, useRoutes } from 'react-router-dom';
import routes from './routes';
import { Alert, ConfigProvider } from 'antd';
import zhCN from 'antd/es/locale/zh_CN';
import AuthProvider from './state/AuthProvider';
import '@/common/style/theme.less';

const App = () => useRoutes(routes);

const root = createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <ConfigProvider
      locale={zhCN}
    >
      <Alert.ErrorBoundary>
        <AuthProvider>
          <HashRouter basename='/'>
            <App />
          </HashRouter>
        </AuthProvider>
      </Alert.ErrorBoundary>
    </ConfigProvider>
  </React.StrictMode>
);
