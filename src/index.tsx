import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter, useRoutes } from 'react-router-dom';
import { Alert } from 'antd';
import { Provider as JotaiProvider } from 'jotai';
import routes from './routes';
import ThemeProvider from './store/Provider/ThemeProvider';
import 'antd/dist/reset.css';

const App = () => useRoutes(routes);

ReactDOM.render(
  <React.StrictMode>
    <Alert.ErrorBoundary>
      <JotaiProvider>
        <HashRouter basename="/">
          <ThemeProvider>
            <App />
          </ThemeProvider>
        </HashRouter>
      </JotaiProvider>
    </Alert.ErrorBoundary>
  </React.StrictMode>,
  document.getElementById('root'),
);
