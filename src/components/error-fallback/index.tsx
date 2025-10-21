import type { FallbackProps } from "react-error-boundary";

import { Button } from "@heroui/react";

import { ReactComponent as ErrorIllustration } from "@/assets/images/error.svg";

const Fallback = ({ resetErrorBoundary }: FallbackProps) => {
  return (
    <div className="window-drag bg-content1 flex h-screen w-screen flex-col items-center justify-center space-y-4">
      <ErrorIllustration style={{ width: 480 }} />
      <div className="window-no-drag flex items-center space-x-2">
        <Button onPress={resetErrorBoundary}>反馈</Button>
        <Button color="primary" onPress={resetErrorBoundary}>
          重试
        </Button>
      </div>
    </div>
  );
};
export default Fallback;
