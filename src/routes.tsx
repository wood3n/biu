import type { RouteObject } from "react-router-dom";

import DefaultLayout from "./layout/default";
import Album from "./pages/album";
import Artist from "./pages/artist";
import CloudDrive from "./pages/cloud-drive";
import Collection from "./pages/collection";
import Daily from "./pages/daily";
import Login from "./pages/login";
import NotFound from "./pages/not-found";
import PlayList from "./pages/playlist";
import Podcast from "./pages/podcast";
import Recent from "./pages/recent";
import Recommend from "./pages/recommend";
import UserProfile from "./pages/user-profile";

const routes: RouteObject[] = [
  {
    path: "/",
    element: <DefaultLayout />,
    children: [
      {
        index: true,
        element: <Recommend />,
      },
      {
        path: "/daily",
        element: <Daily />,
      },
      {
        path: "/profile/:id",
        element: <UserProfile />,
      },
      {
        path: "/collection",
        element: <Collection />,
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
        path: "/playlist/:pid",
        element: <PlayList />,
      },
      {
        path: "/artist/:id",
        element: <Artist />,
      },
      {
        path: "recent",
        element: <Recent />,
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
