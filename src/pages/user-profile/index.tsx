import React from "react";
import { useParams } from "react-router";

import { useRequest } from "ahooks";

import { getSpaceWbiAccInfo } from "@/service/space-wbi-acc-info";

// import { useUser } from '@/common/hooks';

/**
 * 用户个人中心
 */
const UserProfile = () => {
  const { id } = useParams();

  const { data } = useRequest(
    async () => {
      const res = await getSpaceWbiAccInfo({
        mid: id as number,
      });

      return res.data;
    },
    {
      ready: !!id,
      refreshDeps: [id],
    },
  );

  return <div>测试</div>;
};

export default UserProfile;
