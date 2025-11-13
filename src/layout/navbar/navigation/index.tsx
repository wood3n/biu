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
      variant={canGoBack ? "flat" : "light"}
      radius="md"
      isDisabled={!canGoBack}
      onPress={() => navigate(-1)}
      className="window-no-drag w-8 min-w-8"
    >
      <RiArrowLeftSLine size={20} className="text-content1-foreground" />
    </Button>
  );
};

export default Navigation;
