import type { RouteObject } from 'react-router-dom';
import Login from './pages/Login';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import UserProfile from './pages/UserProfile';
import BasicLayout from './layout/basic';
import Daily from './pages/Daily';
import FM from './pages/FM';
import Search from './pages/Search';
import PlayList from './pages/PlayList';
import Album from './pages/Album';
import Artist from './pages/Artist';
import Collect from './pages/Collect';
import Podcast from './pages/Podcast';
import CollectAlbum from './pages/Collect/Album';
import CollectArtist from './pages/Collect/Artist';
import CloudDrive from './pages/cloud-drive';

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
        path: '/profile',
        element: <UserProfile />,
      },
      {
        path: '/search',
        element: <Search />,
      },
      {
        path: '/collect',
        element: <Collect />,
      },
      {
        path: '/podcast',
        element: <Podcast />,
      },
      {
        path: '/drive',
        element: <CloudDrive />,
      },
      {
        path: '/album/:id',
        element: <Album />,
      },
      {
        path: '/collect',
        children: [
          {
            path: 'album',
            element: <CollectAlbum />,
          },
          {
            path: 'artist',
            element: <CollectArtist />,
          },
        ],
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
