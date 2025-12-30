import { memo } from "react";
import { useParams } from "react-router";

import { Button, Link, Skeleton, useDisclosure, User } from "@heroui/react";
import { useRequest } from "ahooks";
import clx from "classnames";

import FallbackImage from "@/assets/images/fallback.png";
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
  onRefresh: VoidFunction;
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
          <Skeleton className="h-[168px] w-[200px]" />
          <div className="flex min-w-0 flex-col items-start space-y-4">
            <Skeleton className="h-[24px] w-[200px]" />
            <Skeleton className="h-[16px] w-[200px]" />
            <Skeleton className="h-[16px] w-[200px]" />
          </div>
        </div>
      );
    }

    return (
      <>
        <div className="mb-4 flex space-x-4">
          <Image
            isBlurred
            radius="md"
            src={cover || FallbackImage}
            fallbackSrc={FallbackImage}
            alt={title}
            width={200}
            height={168}
            className={clx({
              "border-content3 border": !cover,
            })}
            classNames={{
              wrapper: "flex-none",
            }}
          />
          <div className="flex min-w-0 flex-col items-start space-y-4">
            <Button
              variant="light"
              className="block max-w-full truncate px-0 text-3xl"
              onPress={() => {
                if (isCreatedBySelf) {
                  onEditOpen();
                }
              }}
            >
              {title}
            </Button>
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
        <FavoritesEditModal mid={Number(id)} isOpen={isEditOpen} onOpenChange={onEditChange} onRefresh={onRefresh} />
      </>
    );
  },
);

export default Header;
