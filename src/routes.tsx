import type { RouteObject } from "react-router";

import Layout from "./layout";
import ArtistRank from "./pages/artist-rank";
import DownloadList from "./pages/download-list";
import UserFollow from "./pages/follow";
import Later from "./pages/later";
import MusicRank from "./pages/music-rank";
import MusicRecommend from "./pages/music-recommend";
import NotFound from "./pages/not-found";
import Settings from "./pages/settings";
import UserProfile from "./pages/user-profile";
import Folder from "./pages/video-collection";

const routes: RouteObject[] = [
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
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
        path: "collection/:id",
        element: <Folder />,
      },
      {
        path: "user/:id",
        element: <UserProfile />,
      },
      {
        path: "settings",
        element: <Settings />,
      },
      {
        path: "download-list",
        element: <DownloadList />,
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
];

export default routes;
