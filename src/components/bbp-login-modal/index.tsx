import { useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { Button, Input, Modal, ModalBody, ModalContent, Tab, Tabs, addToast } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { bbpAuthLogin } from "@/service/bbp-auth-login";
import { bbpAuthRegister } from "@/service/bbp-auth-register";
import { useBBPPlaylistStore } from "@/store/bbp-playlist";
import { useBBPTokenStore } from "@/store/bbp-token";
import { useFavoritesStore } from "@/store/favorite";
import { useUser } from "@/store/user";

interface Props {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const loginSchema = z.object({
  username: z.string().trim().min(1, "请输入用户名"),
  password: z.string().trim().min(1, "请输入密码"),
});

const registerSchema = z.object({
  username: z.string().trim().min(1, "请输入用户名"),
  password: z.string().trim().min(6, "密码至少 6 位"),
  name: z.string().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

const BBPLoginModal = ({ isOpen, onOpenChange }: Props) => {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
    mode: "onChange",
  });

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { username: "", password: "", name: "" },
    mode: "onChange",
  });

  const onLoginSubmit = async (values: LoginFormValues) => {
    try {
      const res = await bbpAuthLogin({
        username: values.username.trim(),
        password: values.password,
      });

      if (res.token) {
        useBBPTokenStore.getState().setAuth(res.token, res.account);
        await useBBPPlaylistStore.getState().fetchPlaylists();
        const user = useUser.getState().user;
        if (user?.mid) {
          const favStore = useFavoritesStore.getState();
          await favStore.updateCreatedFavorites(user.mid);
          await favStore.updateCollectedFavorites(user.mid);
        } else {
          // B站未登录，仅刷新 BBP 共享歌单
          const favStore = useFavoritesStore.getState();
          await favStore.updateCreatedFavorites("");
          await favStore.updateCollectedFavorites("");
        }
        addToast({ title: "登录成功", color: "success" });
        loginForm.reset();
        onOpenChange(false);
      }
    } catch (error: any) {
      addToast({ title: error?.message || "登录失败", color: "danger" });
    }
  };

  const onRegisterSubmit = async (values: RegisterFormValues) => {
    try {
      const res = await bbpAuthRegister({
        username: values.username.trim(),
        password: values.password,
        name: values.name?.trim() || undefined,
      });

      if (res.token) {
        useBBPTokenStore.getState().setAuth(res.token, res.account);
        await useBBPPlaylistStore.getState().fetchPlaylists();
        const user = useUser.getState().user;
        if (user?.mid) {
          const favStore = useFavoritesStore.getState();
          await favStore.updateCreatedFavorites(user.mid);
          await favStore.updateCollectedFavorites(user.mid);
        } else {
          const favStore = useFavoritesStore.getState();
          await favStore.updateCreatedFavorites("");
          await favStore.updateCollectedFavorites("");
        }
        addToast({ title: "注册成功", color: "success" });
        registerForm.reset();
        onOpenChange(false);
      }
    } catch (error: any) {
      addToast({ title: error?.message || "注册失败", color: "danger" });
    }
  };

  return (
    <Modal
      size="md"
      radius="md"
      scrollBehavior="inside"
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      disableAnimation
      classNames={{ base: "bg-white/80 dark:bg-background/70 backdrop-blur-2xl backdrop-saturate-150" }}
    >
      <ModalContent>
        <ModalBody className="py-6">
          <Tabs
            aria-label="BBPlayer 账号"
            selectedKey={activeTab}
            onSelectionChange={key => setActiveTab(key as "login" | "register")}
            classNames={{
              cursor: "rounded-medium",
              tabList: "bg-default-200/80 dark:bg-default-100/10",
            }}
            radius="md"
            size="sm"
            variant="solid"
            fullWidth
          >
            <Tab key="login" title="登录">
              <form className="mt-4 flex flex-col gap-4" onSubmit={loginForm.handleSubmit(onLoginSubmit)}>
                <Controller
                  control={loginForm.control}
                  name="username"
                  render={({ field, fieldState }) => (
                    <Input
                      label="用户名"
                      labelPlacement="outside"
                      value={field.value}
                      onValueChange={field.onChange}
                      onBlur={field.onBlur}
                      placeholder="请输入用户名"
                      isDisabled={loginForm.formState.isSubmitting}
                      isInvalid={!!fieldState.error}
                      errorMessage={fieldState.error?.message}
                    />
                  )}
                />
                <Controller
                  control={loginForm.control}
                  name="password"
                  render={({ field, fieldState }) => (
                    <Input
                      label="密码"
                      labelPlacement="outside"
                      type="password"
                      value={field.value}
                      onValueChange={field.onChange}
                      onBlur={field.onBlur}
                      placeholder="请输入密码"
                      isDisabled={loginForm.formState.isSubmitting}
                      isInvalid={!!fieldState.error}
                      errorMessage={fieldState.error?.message}
                    />
                  )}
                />
                <Button
                  color="primary"
                  type="submit"
                  className="w-full"
                  isLoading={loginForm.formState.isSubmitting}
                  isDisabled={loginForm.formState.isSubmitting}
                >
                  登录
                </Button>
              </form>
            </Tab>
            <Tab key="register" title="注册">
              <form className="mt-4 flex flex-col gap-4" onSubmit={registerForm.handleSubmit(onRegisterSubmit)}>
                <Controller
                  control={registerForm.control}
                  name="username"
                  render={({ field, fieldState }) => (
                    <Input
                      label="用户名"
                      labelPlacement="outside"
                      value={field.value}
                      onValueChange={field.onChange}
                      onBlur={field.onBlur}
                      placeholder="请输入用户名"
                      isDisabled={registerForm.formState.isSubmitting}
                      isInvalid={!!fieldState.error}
                      errorMessage={fieldState.error?.message}
                    />
                  )}
                />
                <Controller
                  control={registerForm.control}
                  name="password"
                  render={({ field, fieldState }) => (
                    <Input
                      label="密码"
                      labelPlacement="outside"
                      type="password"
                      value={field.value}
                      onValueChange={field.onChange}
                      onBlur={field.onBlur}
                      placeholder="至少 6 位"
                      isDisabled={registerForm.formState.isSubmitting}
                      isInvalid={!!fieldState.error}
                      errorMessage={fieldState.error?.message}
                    />
                  )}
                />
                <Controller
                  control={registerForm.control}
                  name="name"
                  render={({ field }) => (
                    <Input
                      label="显示名（可选）"
                      labelPlacement="outside"
                      value={field.value ?? ""}
                      onValueChange={field.onChange}
                      onBlur={field.onBlur}
                      placeholder="其他用户看到的名称"
                      isDisabled={registerForm.formState.isSubmitting}
                    />
                  )}
                />
                <Button
                  color="primary"
                  type="submit"
                  className="w-full"
                  isLoading={registerForm.formState.isSubmitting}
                  isDisabled={registerForm.formState.isSubmitting}
                >
                  注册
                </Button>
              </form>
            </Tab>
          </Tabs>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default BBPLoginModal;
