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
  Textarea,
  addToast,
} from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { isPrivateFav } from "@/common/utils/fav";
import { postFavFolderAdd } from "@/service/fav-folder-add";
import { postFavFolderEdit } from "@/service/fav-folder-edit";
import { getFavFolderInfo } from "@/service/fav-folder-info";
import { useUser } from "@/store/user";

// 表单校验规则：title 必填（去除首尾空格），intro 可选
const schema = z.object({
  title: z.string().trim().min(1, "名称为必填项"),
  intro: z.string().optional(),
  isPublic: z.boolean().default(true),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  mid?: number;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  afterSubmit?: () => void;
}

const FavoritesEditModal = ({ mid, isOpen, onOpenChange, afterSubmit }: Props) => {
  const updateOwnFolder = useUser(state => state.updateOwnFolder);
  const [isFetching, setIsFetching] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { touchedFields, isSubmitting, isSubmitted, isValid },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { title: "", intro: "", isPublic: true },
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
      reset({ title: "", intro: "", isPublic: true });
    }
  }, [isOpen, mid, reset]);

  const onSubmit = async (values: FormValues) => {
    try {
      if (mid) {
        const res = await postFavFolderEdit({
          media_id: mid,
          title: values.title.trim(),
          intro: values.intro?.trim() ? values.intro.trim() : "",
          privacy: values.isPublic ? 0 : 1,
        });

        if (res?.code === 0) {
          updateOwnFolder();
          reset();
          onOpenChange(false);
          afterSubmit?.();
        } else {
          addToast({
            color: "danger",
            title: "修改失败",
            description: res?.message || "请稍后再试",
          });
        }
      } else {
        const res = await postFavFolderAdd({
          title: values.title.trim(),
          intro: values.intro?.trim() ? values.intro.trim() : "",
          privacy: values.isPublic ? 0 : 1,
        });
        if (res?.code === 0) {
          updateOwnFolder();
          addToast({ color: "success", title: "创建成功" });
          reset();
          onOpenChange(false);
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

  return (
    <Modal
      radius="md"
      size="md"
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      isDismissable={!isSubmitting}
      disableAnimation
    >
      <ModalContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalHeader className="border-b-1 border-b-zinc-800 py-3">{mid ? "修改收藏夹" : "新建收藏夹"}</ModalHeader>
          <ModalBody className="gap-4 py-4">
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
                  placeholder="请输入收藏夹名称"
                  isRequired
                  isDisabled={isFetching || isSubmitting}
                  isInvalid={(touchedFields.title || isSubmitted) && !!fieldState.error}
                  errorMessage={fieldState.error?.message}
                />
              )}
            />

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
