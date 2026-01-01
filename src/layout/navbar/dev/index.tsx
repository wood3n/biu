import { useEffect, useState } from "react";

import { RiCodeLine } from "@remixicon/react";

import IconButton from "@/components/icon-button";

const Dev = () => {
  const [isDev, setIsDev] = useState(false);

  useEffect(() => {
    window.electron.isDev().then(setIsDev);
  }, []);

  if (!isDev) {
    return null;
  }

  return (
    <IconButton onPress={window.electron.toggleDevTools}>
      <RiCodeLine size={18} />
    </IconButton>
  );
};

export default Dev;
