import { useRef, useState } from "react";
import { useParams, useNavigate } from "react-router";

import { addToast, Button, DropdownItemProps, Image, useDisclosure } from "@heroui/react";
import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from "@heroui/react";
import { RiDeleteBinLine, RiEditLine, RiFolderLine, RiFolderOpenLine } from "@remixicon/react";
import { RiMoreLine } from "@remixicon/react";
import clx from "classnames";

import ConfirmModal from "@/components/confirm-modal";
import EditFolderForm from "@/components/folder/form";
import { postFavFolderDel } from "@/service/fav-folder-del";
import { useUser } from "@/store/user";

interface Props {
  title: string;
  mid: number;
  cover?: string;
  editable?: boolean;
}

const FolderItem = ({ title, mid, cover, editable }: Props) => {
  const { updateOwnFolder } = useUser();
  const { id } = useParams();
  const navigate = useNavigate();

  const isActive = id === String(mid);

  const { isOpen: isEditOpen, onOpen: onEditOpen, onOpenChange: onEditOpenChange } = useDisclosure();
  const { isOpen: isDelOpen, onOpen: onDelOpen, onOpenChange: onDelOpenChange } = useDisclosure();

  // 控制悬浮菜单的显隐（鼠标移入次级按钮时打开，移出后延迟关闭）
  const [menuOpen, setMenuOpen] = useState(false);
  const closeTimerRef = useRef<number | null>(null);
  const clearCloseTimer = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };
  const openOnHover = () => {
    clearCloseTimer();
    setMenuOpen(true);
  };

  const closeWithDelay = () => {
    clearCloseTimer();
    closeTimerRef.current = window.setTimeout(() => setMenuOpen(false), 150);
  };

  const menus = [
    {
      key: "edit",
      label: "修改",
      startContent: <RiEditLine size={16} />,
      hidden: !editable,
    },
    {
      key: "delete",
      label: "删除",
      startContent: <RiDeleteBinLine size={16} />,
      color: "danger",
      className: "text-danger",
    },
  ].filter(item => !item.hidden);

  return (
    <Button
      as="div"
      // 使用编程式导航，避免 <a href> 导致整页刷新
      onPress={() => navigate(`/folder/${mid}`)}
      startContent={
        cover ? (
          <Image radius="md" src={cover} alt={title} style={{ width: 32, height: 32 }} />
        ) : isActive ? (
          <RiFolderOpenLine size={18} />
        ) : (
          <RiFolderLine size={18} />
        )
      }
      fullWidth
      className={clx("group relative justify-start", {
        "text-success": isActive,
      })}
      variant={isActive ? "flat" : "light"}
      color="default"
    >
      {title}
      {/* 次级按钮容器：仅在父按钮悬停时显示，绝对定位到右侧垂直居中 */}
      <div
        className={clx(
          "pointer-events-none absolute top-0 right-0 mr-1 inline-flex h-full items-center transition-opacity",
          {
            "opacity-0 group-hover:opacity-100": !menuOpen,
            "opacity-100": menuOpen,
          },
        )}
      >
        <Dropdown offset={2} isOpen={menuOpen} onOpenChange={setMenuOpen} classNames={{ content: "min-w-28" }}>
          <DropdownTrigger>
            <Button
              isIconOnly
              variant="light"
              size="sm"
              type="button"
              className="pointer-events-auto"
              onPointerDown={e => {
                e.stopPropagation();
                e.preventDefault();
              }}
              onPointerUp={e => {
                e.stopPropagation();
                e.preventDefault();
              }}
            >
              <RiMoreLine size={16} />
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            aria-label="收藏夹操作"
            variant="flat"
            disableAnimation
            onMouseEnter={openOnHover}
            onMouseLeave={closeWithDelay}
            onAction={key => {
              if (key === "edit") {
                onEditOpen();
              }

              if (key === "delete") {
                onDelOpen();
              }
              setMenuOpen(false);
            }}
            items={menus}
          >
            {item => (
              <DropdownItem
                key={item.key}
                color={item.color as DropdownItemProps["color"]}
                startContent={item.startContent}
                className={item.className}
              >
                {item.label}
              </DropdownItem>
            )}
          </DropdownMenu>
        </Dropdown>
      </div>
      <EditFolderForm mid={mid} isOpen={isEditOpen} onOpenChange={onEditOpenChange} />
      <ConfirmModal
        type="danger"
        title={`确认删除收藏夹【${title}】？`}
        isOpen={isDelOpen}
        onOpenChange={onDelOpenChange}
        onConfirm={async () => {
          const res = await postFavFolderDel({ media_ids: [mid], csrf: "" });

          if (res?.code === 0) {
            updateOwnFolder();
            return true;
          } else {
            addToast({
              title: res.message || "删除失败",
              color: "danger",
            });
            return false;
          }
        }}
      />
    </Button>
  );
};

export default FolderItem;
