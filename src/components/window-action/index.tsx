import React from "react";

import { Button } from "@heroui/react";
import { RiCloseLine, RiFullscreenLine, RiSubtractLine } from "@remixicon/react";

/**
 * 窗口关闭等按钮操作
 */
const WindowAction: React.FC = () => (
  <div className="flex items-center space-x-6">
    <Button isIconOnly size="sm" variant="light">
      <RiSubtractLine size={18} />
    </Button>
    <Button isIconOnly size="sm" variant="light">
      <RiFullscreenLine size={18} />
    </Button>
    <Button isIconOnly size="sm" variant="light">
      <RiCloseLine size={18} />
    </Button>
  </div>
);

export default WindowAction;
