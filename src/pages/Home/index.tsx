import { useState } from "react";
import { MdLibraryMusic, MdQueueMusic, MdToday } from "react-icons/md";
import { useNavigate } from "react-router-dom";

import { useRequest } from "ahooks";
import { addToast, Button } from "@heroui/react";
import { useTheme } from "@mui/material/styles";

import { MUSIC_FEE } from "@/common/constants";
import { getPersonalizedNewsong, getProgramRecommend, getRecommendResource, getRecommendSongs } from "@/service";
import useUser from "@/store/user-atom";

import Daily from "./daily";

/**
 * 主页
 */
function Home() {
  const theme = useTheme();
  const [user] = useUser();
  const navigate = useNavigate();
  const [selectedTab, setTab] = useState("日推");

  const { data: recommendDailySongs, loading } = useRequest(getRecommendSongs);

  const { data: recommendResource } = useRequest(getRecommendResource);

  const { data: programRecommend } = useRequest(getProgramRecommend);

  const { data: personalizedNewsong } = useRequest(getPersonalizedNewsong);

  const data = [
    {
      tab: "日推",
      icon: <MdToday size={18} />,
      component: (
        <Daily
          loading={loading}
          data={recommendDailySongs?.data?.dailySongs?.filter(
            ({ fee }) => fee === MUSIC_FEE.FREE || fee === MUSIC_FEE.FREE_EX || (user?.userInfo?.profile?.vipType && fee === MUSIC_FEE.VIP),
          )}
        />
      ),
    },
    {
      tab: "歌单",
      icon: <MdLibraryMusic size={18} />,
      imgList:
        recommendResource?.recommend?.map(({ id, name, picUrl }) => ({
          key: id,
          title: name,
          imgUrl: picUrl,
        })) ?? [],
    },
    {
      tab: "音乐",
      icon: <MdQueueMusic size={18} />,
      imgList:
        personalizedNewsong?.result?.map(({ id, name, picUrl }) => ({
          key: id,
          title: name,
          imgUrl: picUrl,
        })) ?? [],
    },
  ];

  return <Button onPress={() => addToast({ title: "测试" })}>测试</Button>;
}

export default Home;
