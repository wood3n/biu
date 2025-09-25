import type { RouteObject } from "react-router";

import Layout from "./layout";
import ArtistRank from "./pages/artist-rank";
import Folder from "./pages/folder";
import UserFollow from "./pages/follow";
import Home from "./pages/home";
import Later from "./pages/later";
import MusicRank from "./pages/music-rank";
import MusicRecommend from "./pages/music-recommend";
import NotFound from "./pages/not-found";
import UserProfile from "./pages/user-profile";

const routes: RouteObject[] = [
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "music-rank",
        element: <MusicRank />,
      },
      {
        path: "artist-rank",
        element: <ArtistRank />,
      },
      {
        path: "music-recommend",
        element: <MusicRecommend />,
      },
      {
        path: "later",
        element: <Later />,
      },
      {
        path: "follow",
        element: <UserFollow />,
      },
      {
        path: "folder/:id",
        element: <Folder />,
      },
      {
        path: "user/:id",
        element: <UserProfile />,
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
];

export default routes;
