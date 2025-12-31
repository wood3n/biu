import type { RouteObject } from "react-router";

import Layout from "./layout";
import ArtistRank from "./pages/artist-rank";
import DownloadList from "./pages/download-list";
import EmptyPage from "./pages/empty";
import FollowList from "./pages/follow-list";
import History from "./pages/history";
import Later from "./pages/later";
import LyricsOverlay from "./pages/lyrics-overlay";
import LyricsOverlaySettings from "./pages/lyrics-overlay-settings";
import MiniPlayer from "./pages/mini-player";
import MusicRank from "./pages/music-rank";
import MusicRecommend from "./pages/music-recommend";
import NotFound from "./pages/not-found";
import Search from "./pages/search";
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
        path: "history",
        element: <History />,
      },
      {
        path: "follow",
        element: <FollowList />,
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
      {
        path: "search",
        element: <Search />,
      },
      {
        path: "empty",
        element: <EmptyPage />,
      },
    ],
  },
  {
    path: "mini-player",
    element: <MiniPlayer />,
  },
  {
    path: "lyrics-overlay",
    element: <LyricsOverlay />,
  },
  {
    path: "lyrics-overlay-settings",
    element: <LyricsOverlaySettings />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
];

export default routes;
