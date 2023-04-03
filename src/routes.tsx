import type { RouteObject } from 'react-router-dom';
import Login from './pages/Login';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import UserProfile from './pages/UserProfile';
import BasicLayout from './Layout/BasicLayout';
import Daily from './pages/Daily';
import FM from './pages/FM';
import Search from './pages/Search';
import PlayList from './pages/PlayList';
import Album from './pages/Album';
import Artist from './pages/Artist';

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
        element: <Daily />,
      },
      {
        path: '/fm',
        element: <FM />,
      },
      {
        path: '/user',
        element: <UserProfile />,
      },
      {
        path: '/search',
        element: <Search />,
      },
      {
        path: '/album/:id',
        element: <Album />,
      },
      {
        path: '/playlist/:pid',
        element: <PlayList />,
      },
      {
        path: '/artist/:id',
        element: <Artist />,
      },
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
