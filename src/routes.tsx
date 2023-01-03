import { RouteObject } from 'react-router-dom';
import BasicLayout from './Layout/BasicLayout';
import Login from '@/pages/Login';
import Daily from './pages/Daily';
import FM from './pages/FM';
import Search from './pages/Search';
import NotFound from '@/pages/NotFound';
import UserProfile from '@/pages/UserProfile';
import PlayList from './pages/PlayList';

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
        element: <Daily />
      },
      {
        path: '/fm',
        element: <FM />
      },
      {
        path: '/search',
        element: <Search />
      },
      {
        path: '/user',
        element: <UserProfile />
      },
      {
        path: '/playlist/:id',
        element: <PlayList />
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
