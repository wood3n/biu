import { memo } from "react";
import { useParams } from "react-router";

import { Link, Skeleton, useDisclosure, User } from "@heroui/react";
import { RiEdit2Line } from "@remixicon/react";
import { useRequest } from "ahooks";
import clx from "classnames";

import { CollectionType } from "@/common/constants/collection";
import { isPrivateFav } from "@/common/utils/fav";
import FavoritesEditModal from "@/components/favorites-edit-modal";
import Image from "@/components/image";
import { getWebInterfaceCard } from "@/service/user-account";
import { useUser } from "@/store/user";

interface Props {
  loading?: boolean;
  type: CollectionType;
  isCreatedBySelf?: boolean;
  attr?: number;
  cover?: string;
  title?: string;
  desc?: string;
  upMid?: number;
  upName?: string;
  mediaCount?: number;
  onRefresh: () => Promise<unknown>;
}

const Header = memo(
  ({ loading, type, isCreatedBySelf, attr, cover, title, desc, upMid, upName, mediaCount, onRefresh }: Props) => {
    const { id } = useParams();
    const user = useUser(s => s.user);

    const { isOpen: isEditOpen, onOpen: onEditOpen, onOpenChange: onEditChange } = useDisclosure();

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

    if (loading) {
      return (
        <div className="mb-4 flex space-x-4">
          <Skeleton className="rounedd-md h-[168px] w-[200px]" />
          <div className="flex min-w-0 flex-col items-start space-y-4">
            <Skeleton className="rounedd-md h-[24px] w-[200px]" />
            <Skeleton className="rounedd-md h-[16px] w-[200px]" />
            <Skeleton className="rounedd-md h-[16px] w-[200px]" />
          </div>
        </div>
      );
    }

    return (
      <>
        <div className="mb-4 flex space-x-4">
          <div className="group relative flex-none">
            <Image
              radius="md"
              shadow="lg"
              src={cover}
              alt={title}
              width={200}
              height={168}
              params="672w_378h_1c.avif"
              className={clx({
                "border-content3 border": !cover,
              })}
            />
            {isCreatedBySelf && (
              <div
                className="absolute inset-0 z-10 flex cursor-pointer items-center justify-center rounded-md bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
                onClick={onEditOpen}
              >
                <div className="flex flex-col items-center gap-2">
                  <RiEdit2Line size={28} />
                  <span className="text-sm">修改</span>
                </div>
              </div>
            )}
          </div>
          <div className="flex min-w-0 flex-col items-start space-y-4">
            <h1 className="text-3xl font-bold">{title}</h1>
            {Boolean(desc) && <p className="text-foreground-400 line-clamp-1 text-sm">{desc}</p>}
            <div className="text-foreground-400 flex items-center space-x-1 text-sm">
              <span>
                {type === CollectionType.Favorite
                  ? `${isCreatedBySelf && Boolean(attr) ? (isPrivateFav(attr as number) ? "私密" : "公开") : ""}收藏夹`
                  : "视频合集"}
              </span>
              <span>•</span>
              <span>{mediaCount} 条视频</span>
            </div>
            {!isCreatedBySelf && (
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
                className="justify-start"
              />
            )}
          </div>
        </div>
        <FavoritesEditModal
          mid={Number(id)}
          isOpen={isEditOpen}
          onOpenChange={onEditChange}
          onRefresh={() =>
            new Promise(resolve =>
              setTimeout(() => {
                onRefresh();
                resolve();
              }, 1000),
            )
          }
        />
      </>
    );
  },
);

export default Header;
