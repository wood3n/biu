import type { FallbackProps } from "react-error-boundary";
import { useNavigate } from "react-router";

import { Button } from "@heroui/react";

import { ReactComponent as ErrorIllustration } from "@/assets/images/error.svg";
import { tauriAdapter } from "@/utils/tauri-adapter";

const Fallback = ({ resetErrorBoundary }: FallbackProps) => {
  const navigate = useNavigate();

  return (
    <div className="window-drag bg-content1 flex h-screen w-screen flex-col items-center justify-center space-y-4">
      <ErrorIllustration style={{ width: 480 }} />
      <div className="window-no-drag flex items-center space-x-2">
        <Button onPress={() => tauriAdapter.openExternal("https://github.com/wood3n/biu/issues")}>反馈</Button>
        <Button
          color="primary"
          onPress={() => {
            navigate("/");
            resetErrorBoundary();
          }}
        >
          回到首页
        </Button>
      </div>
    </div>
  );
};
export default Fallback;
