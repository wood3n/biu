import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Button, Input, addToast } from "@heroui/react";

import { getPassportLoginWebSmsSend } from "@/service/passport-login-web-sms-send";
import { getPassportLoginWebLoginSms } from "@/service/passport-login-web-login-sms";

export interface CodeLoginProps {
  onSuccess?: () => void;
}

interface CodeLoginForm {
  phone: string;
  code: string;
}

const PHONE_REGEX_CN = /^(?:\+?86)?1\d{10}$/; // 简易中国大陆手机号校验

const CodeLogin = ({ onSuccess }: CodeLoginProps) => {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    getValues,
  } = useForm<CodeLoginForm>({
    mode: "onChange",
    defaultValues: { phone: "", code: "" },
  });

  const [captchaKey, setCaptchaKey] = useState<string>("");
  const [countdown, setCountdown] = useState<number>(0);

  useEffect(() => {
    let timer: number | null = null;
    if (countdown > 0) {
      timer = window.setInterval(() => setCountdown(v => (v > 0 ? v - 1 : 0)), 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [countdown]);

  const onSendCode = async (phone: string) => {
    try {
      const tel = Number(phone.replace(/\D/g, ""));
      if (!PHONE_REGEX_CN.test(String(tel))) {
        addToast({ title: "请输入正确的手机号", color: "warning" });
        return;
      }
      const res = await getPassportLoginWebSmsSend({
        cid: 86,
        tel,
        source: "main_web",
        token: "",
        challenge: "",
        validate: "",
        seccode: "",
      });
      if (res.code === 0) {
        setCaptchaKey(res.data?.captcha_key || "");
        addToast({ title: "验证码已发送", color: "success" });
        setCountdown(60);
      } else {
        addToast({ title: res.message || "验证码发送失败", color: "danger" });
      }
    } catch (e: any) {
      addToast({ title: e?.message || "网络异常，稍后重试", color: "danger" });
    }
  };

  const onSubmitCodeLogin = async (values: CodeLoginForm) => {
    try {
      const tel = Number(values.phone.replace(/\D/g, ""));
      const code = Number(values.code.replace(/\D/g, ""));
      if (!captchaKey) {
        addToast({ title: "请先获取验证码", color: "warning" });
        return;
      }
      const resp = await getPassportLoginWebLoginSms({
        cid: 86,
        tel,
        code,
        source: "main_web",
        captcha_key: captchaKey,
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
    <form className="mt-2 space-y-4" onSubmit={handleSubmit(onSubmitCodeLogin)}>
      <Controller
        control={control}
        name="phone"
        rules={{
          required: "请输入手机号",
          pattern: { value: PHONE_REGEX_CN, message: "手机号格式不正确" },
        }}
        render={({ field }) => (
          <Input
            {...field}
            name="phone"
            type="tel"
            label="手机号"
            placeholder="请输入手机号"
            value={field.value}
            onValueChange={val => field.onChange(val)}
            variant="bordered"
            isClearable
            autoComplete="tel"
            startContent={<span className="text-small text-foreground-500 mr-1">+86</span>}
            isInvalid={!!errors.phone}
            errorMessage={errors.phone?.message as string}
          />
        )}
      />

      <div className="flex items-end gap-2">
        <Controller
          control={control}
          name="code"
          rules={{ required: "请输入验证码", minLength: { value: 4, message: "验证码至少4位" } }}
          render={({ field }) => (
            <Input
              {...field}
              className="flex-1"
              type="text"
              label="验证码"
              placeholder="请输入短信验证码"
              value={field.value}
              onValueChange={val => field.onChange(val)}
              variant="bordered"
              isInvalid={!!errors.code}
              errorMessage={errors.code?.message as string}
            />
          )}
        />
        <Button
          type="button"
          variant="flat"
          className="min-w-[112px]"
          isDisabled={countdown > 0}
          onPress={() => onSendCode(getValues("phone") || "")}
        >
          {countdown > 0 ? `${countdown}s` : "获取验证码"}
        </Button>
      </div>

      <Button color="primary" className="w-full" type="submit" isDisabled={isSubmitting} isLoading={isSubmitting}>
        登录
      </Button>
    </form>
  );
};

export default CodeLogin;