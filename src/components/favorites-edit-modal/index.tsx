import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";

import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Switch,
  Tab,
  Tabs,
  Textarea,
  addToast,
} from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { isPrivateFav } from "@/common/utils/fav";
import ImageUpload from "@/components/image-upload";
import { postFavFolderAdd } from "@/service/fav-folder-add";
import { postFavFolderEdit } from "@/service/fav-folder-edit";
import { getFavFolderInfo, type FavFolderInfoData } from "@/service/fav-folder-info";
import { useBBPPlaylistStore } from "@/store/bbp-playlist";
import { useBBPTokenStore } from "@/store/bbp-token";
import { useFavoritesStore } from "@/store/favorite";

import ScrollContainer from "../scroll-container";

// 统一表单校验规则：包含 B站 和 BBPlayer 的所有字段
const schema = z.object({
  title: z.string().trim().min(1, "名称为必填项"),
  intro: z.string().optional(),
  description: z.string().optional(),
  cover: z.string().optional(),
  isPublic: z.boolean().default(true),
});

type FormValues = z.input<typeof schema>;

interface Props {
  /** 收藏夹id */
  mid?: number;
  source?: "bilibili" | "bbplayer";
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSuccess?: (newData: FavFolderInfoData) => void;
}

const FavoritesEditModal = ({ mid, source = "bilibili", isOpen, onOpenChange, onSuccess }: Props) => {
  const addCreatedFavorite = useFavoritesStore(state => state.addCreatedFavorite);
  const modifyCreatedFavorite = useFavoritesStore(state => state.modifyCreatedFavorite);
  const [isFetching, setIsFetching] = useState(false);

  const isEditMode = Boolean(mid);

  // 新建模式下当前选中的来源
  const [activeSource, setActiveSource] = useState<"bilibili" | "bbplayer">(source);
  const effectiveSource = isEditMode ? "bilibili" : activeSource;

  // 检查 BBPlayer 是否已登录
  const bbpToken = useBBPTokenStore(state => state.token);

  useEffect(() => {
    if (isOpen && !isEditMode) {
      setActiveSource(source);
    }
  }, [isOpen, source, isEditMode]);

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { touchedFields, isSubmitting, isSubmitted, isValid },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { title: "", intro: "", description: "", isPublic: true, cover: "" },
    mode: "onChange",
  });

  // 当传入 mid 且弹窗打开时，获取收藏夹数据并填充表单
  useEffect(() => {
    if (!isOpen) return;
    if (mid) {
      let canceled = false;
      setIsFetching(true);
      (async () => {
        try {
          const res = await getFavFolderInfo({ media_id: mid });
          if (!canceled) {
            if (res?.code === 0 && res.data) {
              setValue("title", res.data.title ?? "");
              setValue("intro", res.data.intro ?? "");
              setValue("isPublic", !isPrivateFav(res.data.attr));
              setValue("cover", res.data.cover ?? "");
            } else {
              addToast({ color: "danger", title: "加载失败", description: res?.message || "请稍后再试" });
            }
          }
        } catch (error: any) {
          if (!canceled) {
            addToast({ color: "danger", title: "网络错误", description: error?.message || "请检查网络后重试" });
          }
        } finally {
          if (!canceled) setIsFetching(false);
        }
      })();
      return () => {
        canceled = true;
      };
    } else {
      // 新建模式下清空表单
      reset({ title: "", intro: "", description: "", isPublic: true, cover: "" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, mid, reset]);

  const onSubmit = async (values: FormValues) => {
    try {
      if (mid) {
        // 编辑模式（仅 B站）
        const res = await postFavFolderEdit({
          media_id: mid,
          title: values.title.trim(),
          intro: values.intro?.trim(),
          privacy: values.isPublic ? 0 : 1,
          cover: values.cover,
        });

        if (res?.code === 0 && res.data?.id) {
          modifyCreatedFavorite({
            id: res.data.id,
            title: res.data.title,
            cover: res.data.cover,
            type: res.data.type,
            mid: res.data.mid,
            source: "bilibili",
          });
          reset();
          onOpenChange(false);
          onSuccess?.({
            ...res.data,
            cover: values.cover || "",
          });
        } else {
          addToast({
            color: "danger",
            title: "修改失败",
            description: res?.message || "请稍后再试",
          });
        }
      } else if (effectiveSource === "bbplayer") {
        // 新建 BBPlayer 共享歌单
        const bbpStore = useBBPPlaylistStore.getState();
        const newId = await bbpStore.createPlaylist(values.title.trim());

        if (newId) {
          // 刷新歌单列表
          await bbpStore.fetchPlaylists();
          // 刷新侧边栏
          const favStore = useFavoritesStore.getState();
          await favStore.updateCreatedFavorites("");
          await favStore.updateCollectedFavorites("");
          addToast({ color: "success", title: "创建成功" });
          reset();
          onOpenChange(false);
        }
      } else {
        // 新建 B站收藏夹
        const res = await postFavFolderAdd({
          title: values.title.trim(),
          intro: values.intro?.trim(),
          privacy: values.isPublic ? 0 : 1,
          cover: values.cover,
        });
        if (res?.code === 0 && res.data?.id) {
          addCreatedFavorite({
            id: res.data.id,
            title: res.data.title,
            cover: res.data.cover,
            type: res.data.type,
            mid: res.data.mid,
            source: "bilibili",
          });
          addToast({ color: "success", title: "创建成功" });
          reset();
          onOpenChange(false);
          onSuccess?.({
            ...res.data,
            cover: values.cover || "",
          });
        } else {
          addToast({
            color: "danger",
            title: "创建失败",
            description: res?.message || "请稍后再试",
          });
        }
      }
    } catch (error: any) {
      addToast({
        color: "danger",
        title: "网络错误",
        description: error?.message || "请检查网络后重试",
      });
    }
  };

  const headerTitle = mid ? "修改收藏夹" : "新建收藏夹";

  return (
    <Modal
      radius="md"
      size="md"
      scrollBehavior="inside"
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      isDismissable={!isSubmitting}
      disableAnimation
    >
      <ModalContent>
        <form onSubmit={handleSubmit(onSubmit)} className="flex h-full min-h-0 flex-1 flex-col">
          <ModalHeader className="py-3">{headerTitle}</ModalHeader>
          <ModalBody className="min-h-0 p-0">
            {/* 新建模式下显示来源选择 */}
            {!isEditMode && (
              <div className="px-4 pb-2">
                <Tabs
                  aria-label="选择类型"
                  selectedKey={effectiveSource}
                  onSelectionChange={key => setActiveSource(key as "bilibili" | "bbplayer")}
                  classNames={{
                    cursor: "rounded-medium",
                    tabList: "bg-default-200/80 dark:bg-default-100/10",
                  }}
                  radius="md"
                  size="sm"
                  variant="solid"
                  fullWidth
                >
                  <Tab key="bilibili" title="B站收藏夹" />
                  <Tab key="bbplayer" title="BBPlayer 共享歌单" isDisabled={!bbpToken} />
                </Tabs>
                {effectiveSource === "bbplayer" && !bbpToken && (
                  <p className="text-foreground-400 mt-1 text-xs">请先登录 BBPlayer 账号</p>
                )}
                {effectiveSource === "bbplayer" && bbpToken && (
                  <p className="text-danger mt-1 text-xs">
                    共享歌单存储在云端，所有成员可见。创建后不会出现在 BBPlayer
                    手机端的本地歌单中，需在手机端「订阅共享歌单」或换设备恢复后查看。
                  </p>
                )}
              </div>
            )}
            <ScrollContainer className="px-4">
              <div className="flex flex-col space-y-4">
                <Controller
                  name="cover"
                  control={control}
                  render={({ field }) => (
                    <ImageUpload
                      value={field.value}
                      onChange={field.onChange}
                      disabled={isFetching || isSubmitting}
                      width={240}
                      height={150}
                    />
                  )}
                />

                <Controller
                  name="title"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Input
                      label="名称"
                      labelPlacement="outside"
                      value={field.value}
                      onValueChange={field.onChange}
                      onBlur={field.onBlur}
                      placeholder={effectiveSource === "bbplayer" ? "请输入歌单名称" : "请输入收藏夹名称"}
                      isRequired
                      isDisabled={isFetching || isSubmitting}
                      isInvalid={(touchedFields.title || isSubmitted) && !!fieldState.error}
                      errorMessage={fieldState.error?.message}
                    />
                  )}
                />

                {effectiveSource === "bbplayer" ? (
                  <Controller
                    name="description"
                    control={control}
                    render={({ field }) => (
                      <Textarea
                        label="简介"
                        labelPlacement="outside"
                        placeholder="可选，简单介绍此歌单"
                        value={field.value ?? ""}
                        onValueChange={field.onChange}
                        onBlur={field.onBlur}
                        minRows={4}
                        isDisabled={isFetching || isSubmitting}
                      />
                    )}
                  />
                ) : (
                  <>
                    <Controller
                      name="intro"
                      control={control}
                      render={({ field }) => (
                        <Textarea
                          label="简介"
                          labelPlacement="outside"
                          placeholder="可选，简单介绍此收藏夹"
                          value={field.value}
                          onValueChange={field.onChange}
                          onBlur={field.onBlur}
                          minRows={4}
                          isDisabled={isFetching || isSubmitting}
                        />
                      )}
                    />

                    <Controller
                      name="isPublic"
                      control={control}
                      render={({ field }) => (
                        <Switch
                          isSelected={Boolean(field.value)}
                          onValueChange={field.onChange}
                          isDisabled={isFetching || isSubmitting}
                        >
                          {field.value ? "公开" : "私密"}
                        </Switch>
                      )}
                    />
                  </>
                )}
              </div>
            </ScrollContainer>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="light"
              onPress={() => {
                reset();
                onOpenChange(false);
              }}
              isDisabled={isSubmitting || isFetching}
            >
              取消
            </Button>
            <Button type="submit" color="primary" isLoading={isSubmitting} isDisabled={!isValid || isFetching}>
              提交
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default FavoritesEditModal;
