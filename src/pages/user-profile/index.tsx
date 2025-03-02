import React from "react";

// import { useUser } from '@/common/hooks';
import { useUser } from "@/store/user";

/**
 * 用户个人中心
 */
const UserProfile: React.FC = () => {
  const user = useUser(store => store.user);

  return <div>个人资料</div>;
};

export default UserProfile;
