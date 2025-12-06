import { useEffect } from "react";
import { useHref, useNavigate, useRoutes } from "react-router";

import { HeroUIProvider, ToastProvider } from "@heroui/react";
import moment from "moment";

import { getCookitFromBSite } from "./common/utils/cookie";
import Theme from "./components/theme";
import routes from "./routes";
import { useAppUpdateStore } from "./store/app-update";
import { usePlayQueue } from "./store/play-queue";

import "moment/locale/zh-cn";

import "overlayscrollbars/overlayscrollbars.css";
import "./app.css";

moment.locale("zh-cn");

export function App() {
  const routeElement = useRoutes(routes);
  const navigate = useNavigate();
  const setUpdate = useAppUpdateStore(s => s.setUpdate);

  useEffect(() => {
    getCookitFromBSite();
  }, []);

  useEffect(() => {
    if (window.electron && window.electron.navigate) {
      const removeListener = window.electron.navigate(path => navigate(path));
      return removeListener;
    }
  }, [navigate]);

  // 订阅来自主进程的任务栏缩略按钮命令
  useEffect(() => {
    if (window.electron && window.electron.onPlayerCommand) {
      window.electron.onPlayerCommand(cmd => {
        const { prev, next, togglePlay, toggleMute, setVolume, volume } = usePlayQueue.getState();
        if (cmd === "prev") {
          prev();
        } else if (cmd === "next") {
          next();
        } else if (cmd === "toggle") {
          togglePlay();
        } else if (cmd === "toggle-mute") {
          toggleMute();
        } else if (cmd === "volume-up") {
          // 增加音量，步长为0.02，最大不超过1
          setVolume(Math.min(volume + 0.02, 1));
        } else if (cmd === "volume-down") {
          // 减少音量，步长为0.02，最小不低于0
          setVolume(Math.max(volume - 0.02, 0));
        }
      });
    }
  }, []);

  useEffect(() => {
    const removeListener = window.electron.onUpdateAvailable(updateInfo => {
      setUpdate({
        isUpdateAvailable: true,
        latestVersion: updateInfo.latestVersion,
        releaseNotes: updateInfo.releaseNotes,
      });
    });

    return () => {
      removeListener();
    };
  }, []);

  return (
    <HeroUIProvider navigate={navigate} useHref={useHref} locale="zh-CN">
      <ToastProvider
        placement="bottom-right"
        toastOffset={90}
        maxVisibleToasts={3}
        toastProps={{ timeout: 3000, color: "primary" }}
      />
      <Theme>{routeElement}</Theme>
    </HeroUIProvider>
  );
}
