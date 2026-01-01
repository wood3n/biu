import { useState } from "react";
import { useNavigate } from "react-router";

import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from "@heroui/react";
import { RiMoreFill, RiPlayFill } from "@remixicon/react";
import clx from "classnames";

import Image from "@/components/image";
import { type PlayData } from "@/store/play-list";

import { getMenus } from "./menu";

interface Props {
  data: PlayData;
  isLogin: boolean;
  isPlaying?: boolean;
  onAction: (key: string, itemData: PlayData) => void;
  onClose: VoidFunction;
  onPress?: VoidFunction;
}

const ListItem = ({ data, isLogin, isPlaying, onAction, onClose, onPress }: Props) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Button
      as="div"
      key={data.id}
      fullWidth
      disableAnimation
      variant="light"
      color={isPlaying ? "primary" : "default"}
      onPress={onPress}
      className="group flex h-auto min-h-auto w-full min-w-auto items-center justify-between space-y-2 rounded-md p-2"
    >
      <div className="m-0 flex min-w-0 flex-1 items-center">
        <div className="relative h-12 w-12 flex-none">
          <Image removeWrapper radius="md" src={data.cover} alt={data.title} width={48} height={48} />
          {!isPlaying && (
            <div className="absolute inset-0 z-20 flex items-center justify-center rounded-md bg-[rgba(0,0,0,0.35)] opacity-0 group-hover:opacity-100">
              <RiPlayFill size={20} className="text-white transition-transform duration-200 group-hover:scale-110" />
            </div>
          )}
        </div>
        <div className="ml-2 flex min-w-0 flex-auto flex-col items-start space-y-1">
          <span className="w-full min-w-0 truncate text-base">{data.title}</span>
          <span
            className={clx("text-foreground-500 w-fit truncate text-sm hover:underline", {
              "cursor-pointer": Boolean(data?.ownerMid),
            })}
            onClick={e => {
              e.stopPropagation();
              if (!data?.ownerMid) return;
              navigate(`/user/${data?.ownerMid}`);
              onClose();
            }}
          >
            {data?.ownerName || "未知"}
          </span>
        </div>
        <Dropdown
          disableAnimation
          isOpen={isOpen}
          onOpenChange={setIsOpen}
          classNames={{
            content: "min-w-fit",
          }}
        >
          <DropdownTrigger>
            <Button
              isIconOnly
              variant="light"
              size="sm"
              className={`flex-none transition-opacity duration-200 ${isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"} group-hover:pointer-events-auto group-hover:opacity-100`}
            >
              <RiMoreFill size={16} />
            </Button>
          </DropdownTrigger>
          {/* @ts-ignore 忽略onAction类型问题 */}
          <DropdownMenu aria-label="播放列表操作菜单" items={getMenus({ isLogin })} onAction={onAction}>
            {item => (
              <DropdownItem key={item.key} color={item.color} startContent={item.icon}>
                {item.label}
              </DropdownItem>
            )}
          </DropdownMenu>
        </Dropdown>
      </div>
    </Button>
  );
};

export default ListItem;
