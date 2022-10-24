import { RouteObject } from 'react-router-dom';
import BasicLayout from './Layout/BasicLayout';
import Home from '@/pages/Home';
import Login from '@/pages/Login';
import Daily from './pages/Daily';
import FM from './pages/FM';
import NotFound from '@/pages/NotFound';

/**
 * layout 组件不能用 lazy load，生产环境会报错
 */
const routes: RouteObject[] = [
  {
    path: '/',
    element: <BasicLayout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: '/daily',
        element: <Daily />
      },
      {
        path: '/fm',
        element: <FM />
      }
    ],
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '*',
    element: <NotFound />,
  },
];

export default routes;
