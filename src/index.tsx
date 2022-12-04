import React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, useRoutes } from 'react-router-dom';
import routes from './routes';
import { Alert, ConfigProvider, theme } from 'antd';
import zhCN from 'antd/es/locale/zh_CN';
import AuthProvider from './store/LoginProvider';
import UserProvider from './store/UserProvider';
import 'antd/dist/reset.css';

const App = () => useRoutes(routes);

const root = createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <ConfigProvider
      locale={zhCN}
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: '#1fdf64',
          colorTextBase: '#ffffff',
          colorBgBase: '#000000',
          colorBgLayout: '#000000',
        },
        components: {
          Layout: {
            colorBgLayout: '#000000'
          },
          Menu: {
            borderRadius: 2
          },
          Input: {
            borderRadius: 16,
          },
          Button: {
            borderRadius: 16,
            borderRadiusSM: 16
          }
        }
      }}
    >
      <Alert.ErrorBoundary>
        <AuthProvider>
          <UserProvider>
            <HashRouter basename='/'>
              <App />
            </HashRouter>
          </UserProvider>
        </AuthProvider>
      </Alert.ErrorBoundary>
    </ConfigProvider>
  </React.StrictMode>
);
