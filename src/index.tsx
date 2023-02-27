import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter, useRoutes } from 'react-router-dom';
import { Alert, ConfigProvider, theme } from 'antd';
import zhCN from 'antd/es/locale/zh_CN';
import routes from './routes';
import AuthProvider from './store/LoginProvider';
import UserProvider from './store/UserProvider';
import AudioProvider from './store/AudioProvider';
import 'antd/dist/reset.css';

const App = () => useRoutes(routes);

ReactDOM.render(
  <React.StrictMode>
    <ConfigProvider
      locale={zhCN}
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: '#1fdf64',
          colorTextBase: '#ffffff',
          colorBgBase: '#000000',
          colorBgContainer: '#121212',
          colorBgLayout: '#000000',
          wireframe: true,
          colorLink: '#ffffff',
          colorLinkHover: '#1fdf64',
        },
        components: {
          Layout: {
            colorBgLayout: '#000000',
          },
          Menu: {
            borderRadius: 2,
          },
          Input: {
            borderRadius: 16,
          },
          Button: {
            borderRadius: 16,
            borderRadiusSM: 16,
          },
        },
      }}
    >
      <Alert.ErrorBoundary>
        <AuthProvider>
          <UserProvider>
            <AudioProvider>
              <HashRouter basename="/">
                <App />
              </HashRouter>
            </AudioProvider>
          </UserProvider>
        </AuthProvider>
      </Alert.ErrorBoundary>
    </ConfigProvider>
  </React.StrictMode>,
  document.getElementById('root'),
);
