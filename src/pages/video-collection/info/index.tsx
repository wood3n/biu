import { useParams } from "react-router";

import { Image, Link, Skeleton, User } from "@heroui/react";
import { RiPlayFill, RiStarFill, RiStarLine } from "@remixicon/react";
import { useRequest } from "ahooks";
import { useShallow } from "zustand/react/shallow";

import FallbackImage from "@/assets/images/fallback.png";
import { CollectionType } from "@/common/constants/collection";
import AsyncButton from "@/components/async-button";
import Ellipsis from "@/components/ellipsis";
import { postFavFolderFav } from "@/service/fav-folder-fav";
import { postFavFolderUnfav } from "@/service/fav-folder-unfav";
import { postFavSeasonFav } from "@/service/fav-season-fav";
import { postFavSeasonUnfav } from "@/service/fav-season-unfav";
import { getWebInterfaceCard } from "@/service/user-account";
import { useUser } from "@/store/user";

import Menu from "./menu";

interface Props {
  type: CollectionType;
  loading?: boolean;
  attr?: number;
  cover?: string;
  title?: string;
  desc?: string;
  upMid?: number;
  upName?: string;
  mediaCount?: number;
  afterChangeInfo: VoidFunction;
  onPlayAll: VoidFunction;
}

const Info = ({
  type,
  loading,
  attr,
  cover,
  title,
  desc,
  upMid,
  upName,
  mediaCount,
  afterChangeInfo,
  onPlayAll,
}: Props) => {
  const { user, collectedFolder, updateCollectedFolder } = useUser(
    useShallow(state => ({
      user: state.user,
      collectedFolder: state.collectedFolder,
      updateCollectedFolder: state.updateCollectedFolder,
    })),
  );

  const isOwn = upMid === user?.mid;
  const { id } = useParams();
  const isCollected = collectedFolder?.some(folder => folder.id === Number(id));

  const { data: upInfo } = useRequest(
    async () => {
      const res = await getWebInterfaceCard({
        mid: upMid as number,
      });

      return res?.data;
    },
    {
      ready: Boolean(upMid) && upMid !== user?.mid,
      refreshDeps: [upMid],
    },
  );

  const toggleCollect = async () => {
    if (type === CollectionType.Favorite) {
      if (isCollected) {
        // 取消收藏
        const res = await postFavFolderUnfav({
          media_id: Number(id),
          platform: "web",
        });

        if (res.code === 0) {
          await updateCollectedFolder();
        }
      } else {
        // 收藏
        const res = await postFavFolderFav({
          media_id: Number(id),
          platform: "web",
        });

        if (res.code === 0) {
          await updateCollectedFolder();
        }
      }
    } else {
      if (isCollected) {
        // 取消收藏
        const res = await postFavSeasonUnfav({
          season_id: Number(id),
          platform: "web",
        });

        if (res.code === 0) {
          await updateCollectedFolder();
        }
      } else {
        // 收藏
        const res = await postFavSeasonFav({
          season_id: Number(id),
          platform: "web",
        });

        if (res.code === 0) {
          await updateCollectedFolder();
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="mb-4 flex space-x-4">
        <Skeleton className="h-[230px] w-[230px] rounded-lg" />
        <div className="flex flex-col items-start justify-start space-y-4">
          <Skeleton className="h-12 w-48 rounded-lg" />
          <Skeleton className="h-4 w-24 rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6 flex space-x-4">
      <Image
        isBlurred
        radius="md"
        src={cover || FallbackImage}
        fallbackSrc={FallbackImage}
        alt={title}
        width={230}
        height={230}
        className="object-cover"
        classNames={{
          wrapper: "flex-none",
        }}
      />
      <div className="flex flex-col justify-between">
        <div className="flex flex-col items-start space-y-4">
          <h1 className="text-3xl">{title}</h1>
          {Boolean(desc) && <Ellipsis className="text-sm text-zinc-500">{desc}</Ellipsis>}
          {!isOwn && (
            <User
              avatarProps={{
                size: "sm",
                src: upInfo?.card?.face,
              }}
              name={
                <Link color="foreground" href={`/user/${upMid}`} className="hover:underline">
                  {upName}
                </Link>
              }
            />
          )}
          <div className="flex items-center space-x-2 text-sm text-zinc-400">
            <span>{type === CollectionType.Favorite ? "收藏夹" : "视频合集"}</span>
            <span>•</span>
            <span>{mediaCount} 条视频</span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {(mediaCount ?? 0) > 0 && (
            <AsyncButton color="primary" startContent={<RiPlayFill className="text-inherit" />} onPress={onPlayAll}>
              播放全部
            </AsyncButton>
          )}
          {isOwn && attr !== 0 && <Menu afterChangeInfo={afterChangeInfo} />}
          {!isOwn && (
            <AsyncButton
              color={isCollected ? "default" : "primary"}
              startContent={isCollected ? <RiStarFill size={18} /> : <RiStarLine size={18} />}
              onPress={toggleCollect}
            >
              {isCollected ? "取消收藏" : "收藏"}
            </AsyncButton>
          )}
        </div>
      </div>
    </div>
  );
};

export default Info;
