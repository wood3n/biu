import React, { useState } from "react";

import { useRequest } from "ahooks";

import { getUserRecord } from "@/service";
import { useUser } from "@/store/user";

/**
 * 我的听歌排行
 */
const MyPlayRank: React.FC = () => {
  const user = useUser(store => store.user);
  const [type, setType] = useState("1");

  const { data, runAsync, loading } = useRequest(
    () => {
      return getUserRecord({
        uid: user?.profile?.userId,
        type,
      });
    },
    {
      manual: true,
      refreshDeps: [type],
    },
  );

  return <div>听歌排行</div>;
};

export default MyPlayRank;
