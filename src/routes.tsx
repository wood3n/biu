import { RouteObject } from 'react-router-dom';
import BasicLayout from './Layout/BasicLayout';
import Home from '@/pages/Home';
import Login from '@/pages/Login';
import NotFound from '@/pages/NotFound';

interface Routes extends Omit<RouteObject, 'children'> {
  title?: string;
  children?: Routes[];
}

/**
 * layout 组件不能用 lazy load，生产环境会报错
 */
const routes: Routes[] = [
  {
    path: '/',
    element: <BasicLayout />,
    children: [
      {
        title: '主页',
        index: true,
        element: <Home />,
      },
    ],
  },
  {
    path: 'login',
    element: <Login />,
  },
  {
    path: '*',
    element: <NotFound />,
  }
];

export default routes;
