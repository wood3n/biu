import type { RouteObject } from 'react-router-dom';
import GridLayout from './layout/grid';
import Login from './pages/login';
import Home from './pages/home';
import NotFound from './pages/not-found';
import UserProfile from './pages/user-profile';
import BasicLayout from './layout/basic';
import FM from './pages/fm';
import Search from './pages/search';
import PlayList from './pages/playlist';
import Album from './pages/album';
import Artist from './pages/artist';
import Collect from './pages/collect';
import Podcast from './pages/podcast';
import CollectAlbum from './pages/collect/album';
import CollectArtist from './pages/collect/artist';
import CloudDrive from './pages/cloud-drive';

const routes: RouteObject[] = [
  {
    path: '/',
    // element: <BasicLayout />,
    element: <GridLayout />,
    children: [
      {
        index: true,
        element: <Home />,
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
