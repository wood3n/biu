import React from "react";

import { ReactComponent as IconEmpty } from "@/assets/icons/empty.svg";

const Empty = () => {
  return (
    <div className="flex flex-col items-center justify-center">
      <IconEmpty />
      <p>暂无数据</p>
    </div>
  );
};

export default Empty;
