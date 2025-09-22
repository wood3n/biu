import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { Button, Form, Input, Tab, Tabs, Tooltip, addToast } from "@heroui/react";
import { RiEyeLine, RiEyeOffLine, RiMailSendLine, RiMailSendLine } from "@remixicon/react";
import { JSEncrypt } from "jsencrypt";

import { getPassportLoginWebKey } from "@/service/passport-login-web-key";
import { postPassportLoginWebLoginPassword } from "@/service/passport-login-web-login-passport";

export interface PasswordLoginProps {
  onSuccess?: () => void;
}

interface PasswordLoginForm {
  phone: string;
  password: string;
}

const PHONE_REGEX_CN = /^(?:\+?86)?1\d{10}$/; // 简易中国大陆手机号校验

const PasswordLogin = ({ onSuccess }: PasswordLoginProps) => {
  const [loginType, setLoginType] = useState<string>("password");

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<PasswordLoginForm>({
    mode: "onChange",
    defaultValues: { phone: "", password: "" },
  });

  const [isPwdVisible, setPwdVisible] = useState<boolean>(false);

  useEffect(() => {
    return () => {
      reset({ phone: "", password: "" });
      setPwdVisible(false);
    };
  }, [reset]);

  const onSubmitPasswordLogin = async (values: PasswordLoginForm) => {
    try {
      const tel = Number(values.phone.replace(/\D/g, ""));
      const rawPwd = values.password;

      const webKey = await getPassportLoginWebKey();
      if (webKey.code !== 0 || !webKey.data?.key || !webKey.data?.hash) {
        addToast({ title: webKey.message || "获取登录公钥失败", color: "danger" });
        return;
      }

      const encryptor = new JSEncrypt();
      encryptor.setPublicKey(webKey.data.key);
      const encrypted = encryptor.encrypt(webKey.data.hash + rawPwd);
      if (!encrypted) {
        addToast({ title: "密码加密失败，请重试", color: "danger" });
        return;
      }

      const resp = await postPassportLoginWebLoginPassword({
        cid: 86,
        tel,
        password: encrypted,
        source: "main_web",
        keep: true,
      });
      if (resp.code === 0) {
        addToast({ title: "登录成功", color: "success" });
        onSuccess?.();
      } else {
        addToast({ title: resp.message || "登录失败", color: "danger" });
      }
    } catch (e: any) {
      addToast({ title: e?.message || "网络异常，稍后重试", color: "danger" });
    }
  };

  return (
    <div className="flex flex-1 flex-col p-4">
      <Tabs
        fullWidth
        aria-label="登录方式"
        variant="solid"
        selectedKey={loginType}
        onSelectionChange={key => setLoginType(key as string)}
        className="mb-4"
      >
        <Tab key="password" title="手机号登录" />
        <Tab key="code" title="验证码登录" />
      </Tabs>
      <Form className="gap-4" onSubmit={handleSubmit(onSubmitPasswordLogin)}>
        <Input
          name="phone"
          type="tel"
          label="手机号"
          placeholder="请输入手机号"
          variant="bordered"
          autoComplete="tel"
          startContent={<span className="text-small text-foreground-500 mr-1">+86</span>}
          endContent={
            loginType === "code" && (
              <Tooltip content="发送验证码" closeDelay={0}>
                <Button isIconOnly size="sm">
                  <RiMailSendLine size={16} />
                </Button>
              </Tooltip>
            )
          }
          isInvalid={!!errors.phone}
          errorMessage={errors.phone?.message as string}
        />

        <Input
          type={isPwdVisible ? "text" : "password"}
          label="密码"
          placeholder="请输入密码"
          variant="bordered"
          autoComplete="current-password"
          isInvalid={!!errors.password}
          errorMessage={errors.password?.message as string}
          endContent={
            <Button
              size="sm"
              variant="light"
              className="min-w-0 px-2"
              type="button"
              onPress={() => setPwdVisible(v => !v)}
            >
              {isPwdVisible ? <RiEyeLine size={18} /> : <RiEyeOffLine size={18} />}
            </Button>
          }
        />

        <Button color="primary" className="w-full" type="submit" isDisabled={isSubmitting} isLoading={isSubmitting}>
          登录
        </Button>
      </Form>
    </div>
  );
};

export default PasswordLogin;
