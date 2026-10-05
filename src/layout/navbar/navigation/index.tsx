import React from "react";
import { useLocation, useNavigate } from "react-router";

import { Button } from "@heroui/react";
import { RiArrowLeftSLine } from "@remixicon/react";

const Navigation: React.FC = () => {
  const navigate = useNavigate();
  // subscribe to location changes to re-render and reflect history state updates
  useLocation();

  const canGoBack = (window.history?.state?.idx ?? 0) > 0;

  return (
    <Button
      isIconOnly
      variant="light"
      radius="md"
      isDisabled={!canGoBack}
      onPress={() => navigate(-1)}
      className="bg-default-400/20 hover:bg-default-400/30 dark:bg-default-500/20 dark:hover:bg-default-500/30 h-[41.5px] min-h-[41.5px] w-[41.5px] min-w-[41.5px] translate-y-[0.5px]"
    >
      <RiArrowLeftSLine size={20} />
    </Button>
  );
};

export default Navigation;
