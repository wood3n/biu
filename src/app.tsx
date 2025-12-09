import { useEffect, useState } from "react";
import { useHref, useNavigate, useRoutes } from "react-router";

import { HeroUIProvider, ToastProvider } from "@heroui/react";
import moment from "moment";

import ConfirmModal from "./components/confirm-modal";
import Theme from "./components/theme";
import routes from "./routes";
import { useAppUpdateStore } from "./store/app-update";
import { usePlayList } from "./store/play-list";
import { useToken } from "./store/token";
import { useUser } from "./store/user";

import "moment/locale/zh-cn";

import "overlayscrollbars/overlayscrollbars.css";
import "./app.css";

moment.locale("zh-cn");

export function App() {
  const routeElement = useRoutes(routes);
  const navigate = useNavigate();
  const setUpdate = useAppUpdateStore(s => s.setUpdate);

  const { user } = useUser();

  // 账号切换确认提示框状态
  const [isSwitchAccountModalOpen, setIsSwitchAccountModalOpen] = useState(false);

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
        const { prev, next, togglePlay } = usePlayList.getState();
        if (cmd === "prev") {
          prev();
        } else if (cmd === "next") {
          next();
        } else if (cmd === "toggle") {
          togglePlay();
        }
      });
    }
  }, []);

  // 订阅来自主进程的账号切换命令
  useEffect(() => {
    if (window.electron && window.electron.onSwitchAccount) {
      const removeListener = window.electron.onSwitchAccount(() => {
        // 如果用户未登录，直接显示提示
        if (!user) {
          import("@heroui/react").then(({ addToast }) => {
            addToast({
              title: "当前未登录",
              color: "warning",
            });
          });
          return;
        }
        // 如果已登录，显示确认提示框
        setIsSwitchAccountModalOpen(true);
      });
      return removeListener;
    }
  }, [user]);

  // 处理账号切换确认
  const handleSwitchAccountConfirm = async () => {
    try {
      // 清除当前用户信息和token
      const { clear: clearUser } = useUser.getState();
      const { clear: clearToken } = useToken.getState();
      clearUser();
      clearToken();
      // 显示主窗口
      window.electron.switchToMainWindow();
      // 触发全局账号切换事件，让 UserCard 组件显示登录模态框
      window.dispatchEvent(new Event("switchAccount"));
      return true;
    } catch {
      return false;
    }
  };

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
  }, [setUpdate]);

  return (
    <HeroUIProvider navigate={navigate} useHref={useHref} locale="zh-CN">
      <ToastProvider
        placement="bottom-right"
        toastOffset={90}
        maxVisibleToasts={3}
        toastProps={{ timeout: 3000, color: "primary" }}
      />
      <Theme>{routeElement}</Theme>

      {/* 账号切换确认提示框 */}
      <ConfirmModal
        type="danger"
        title="确认切换账号？"
        description="当前账号将登出，是否继续？"
        isOpen={isSwitchAccountModalOpen}
        onOpenChange={setIsSwitchAccountModalOpen}
        onConfirm={handleSwitchAccountConfirm}
      />
    </HeroUIProvider>
  );
}
