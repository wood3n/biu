import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { Button, Form, Input, Link, addToast } from "@heroui/react";
import { RiEyeLine, RiEyeOffLine } from "@remixicon/react";
import { JSEncrypt } from "jsencrypt";

import { useGeetest } from "@/hooks/use-geetest";
import { getPassportLoginWebKey } from "@/service/passport-login-web-key";
import { postPassportLoginWebLoginPassword } from "@/service/passport-login-web-login-passport";

export interface PasswordLoginProps {
  onSuccess?: () => void;
}

interface PasswordLoginForm {
  username: string;
  password: string;
}

const PasswordLogin = ({ onSuccess }: PasswordLoginProps) => {
  const { verify, loading: geetestLoading } = useGeetest();
  const [isPwdVisible, setPwdVisible] = useState<boolean>(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<PasswordLoginForm>({
    mode: "onChange",
    defaultValues: { username: "", password: "" },
  });

  useEffect(() => {
    return () => {
      reset({ username: "", password: "" });
      setPwdVisible(false);
    };
  }, [reset]);

  const onSubmitPasswordLogin = async (values: PasswordLoginForm) => {
    try {
      const { username, password: rawPwd } = values;

      // 1. Get Public Key
      const webKey = await getPassportLoginWebKey();
      if (webKey.code !== 0 || !webKey.data?.key || !webKey.data?.hash) {
        addToast({ title: webKey.message || "获取登录公钥失败", color: "danger" });
        return;
      }

      // 2. Encrypt Password
      const encryptor = new JSEncrypt();
      encryptor.setPublicKey(webKey.data.key);
      const encrypted = encryptor.encrypt(webKey.data.hash + rawPwd);
      if (!encrypted) {
        addToast({ title: "密码加密失败，请重试", color: "danger" });
        return;
      }

      // 3. Geetest Verification
      const gtResult = await verify();
      if (!gtResult) return;

      // 4. Login
      const resp = await postPassportLoginWebLoginPassword({
        username,
        password: encrypted,
        keep: 0,
        token: gtResult.token,
        challenge: gtResult.challenge,
        validate: gtResult.validate,
        seccode: gtResult.seccode,
        source: "main_web",
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
    <Form className="flex w-full flex-col gap-4" onSubmit={handleSubmit(onSubmitPasswordLogin)}>
      <Controller
        control={control}
        name="username"
        rules={{ required: "请输入账号" }}
        render={({ field }) => (
          <Input
            {...field}
            label="账号"
            placeholder="请输入手机号/邮箱"
            variant="bordered"
            autoComplete="username"
            isInvalid={!!errors.username}
            errorMessage={errors.username?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="password"
        rules={{ required: "请输入密码" }}
        render={({ field }) => (
          <Input
            {...field}
            type={isPwdVisible ? "text" : "password"}
            label="密码"
            placeholder="请输入密码"
            variant="bordered"
            autoComplete="current-password"
            isInvalid={!!errors.password}
            errorMessage={errors.password?.message}
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
        )}
      />

      <Button
        color="primary"
        className="w-full"
        type="submit"
        isDisabled={isSubmitting || geetestLoading}
        isLoading={isSubmitting || geetestLoading}
      >
        登录
      </Button>

      <div className="flex w-full items-center justify-center px-1">
        <Link
          onPress={() => window.electron.openExternal("https://passport.bilibili.com/pc/passport/findPassword")}
          size="sm"
          className="text-primary cursor-pointer hover:underline"
        >
          忘记密码?
        </Link>
      </div>
    </Form>
  );
};

export default PasswordLogin;
