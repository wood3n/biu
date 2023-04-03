import React from 'react';
import { ConfigProvider, theme } from 'antd';
import zhCN from 'antd/es/locale/zh_CN';

const ThemeProvider = ({ children }: React.PropsWithChildren) => (
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
    {children}
  </ConfigProvider>
);

export default ThemeProvider;
