import type { RouteObject } from "react-router-dom";

import DefaultLayout from "./layout/default";
import Album from "./pages/album";
import Artist from "./pages/artist";
import CloudDrive from "./pages/cloud-drive";
import Collect from "./pages/collect";
import CollectAlbum from "./pages/collect/album";
import CollectArtist from "./pages/collect/artist";
import Daily from "./pages/daily";
import FM from "./pages/fm";
import Home from "./pages/home";
import Login from "./pages/login";
import NotFound from "./pages/not-found";
import PlayList from "./pages/playlist";
import Podcast from "./pages/podcast";
import UserProfile from "./pages/user-profile";

const routes: RouteObject[] = [
  {
    path: "/",
    element: <DefaultLayout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "/daily",
        element: <Daily />,
      },
      {
        path: "/fm",
        element: <FM />,
      },
      {
        path: "/profile/:id",
        element: <UserProfile />,
      },
      {
        path: "/collect",
        element: <Collect />,
      },
      {
        path: "/podcast",
        element: <Podcast />,
      },
      {
        path: "/drive",
        element: <CloudDrive />,
      },
      {
        path: "/album/:id",
        element: <Album />,
      },
      {
        path: "/collect",
        children: [
          {
            path: "album",
            element: <CollectAlbum />,
          },
          {
            path: "artist",
            element: <CollectArtist />,
          },
        ],
      },
      {
        path: "/playlist/:pid",
        element: <PlayList />,
      },
      {
        path: "/artist/:id",
        element: <Artist />,
      },
    ],
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
];

export default routes;
