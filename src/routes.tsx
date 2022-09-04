import { RouteObject } from 'react-router-dom';
import BasicLayout from './Layout/BasicLayout';
import LazyLoad from './components/LazyLoad';

interface Routes extends Omit<RouteObject, 'children'> {
  title?: string;
  children?: Routes[];
}

/**
 * layout 组件不能用 lazy load，生产环境会报错
 */
const routes: Routes[] = [
  {
    path: '/login',
    element: <LazyLoad path='pages/Login' />,
  },
  {
    path: '/',
    element: <BasicLayout />,
    children: [
      {
        title: '主页',
        index: true,
        element: <LazyLoad path='pages/Home' />,
      },
    ],
  },
];

export default routes;
