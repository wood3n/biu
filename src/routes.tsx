import type { RouteObject } from "react-router";

import Layout from "./layout";
import Home from "./pages/home";
import Login from "./pages/login";
import MusicRank from "./pages/music-rank";
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
        path: "profile",
        element: <UserProfile />,
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
