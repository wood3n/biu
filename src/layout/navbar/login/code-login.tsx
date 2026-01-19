import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { Button, Input, Select, SelectItem, addToast } from "@heroui/react";
import { useRequest } from "ahooks";

import { useGeetest } from "@/common/hooks/use-geetest";
import { getGenericCountryList } from "@/service/generic-country-list";
import { getPassportLoginDefaultCountry } from "@/service/passport-login-web-country";
import { getPassportLoginWebLoginSms } from "@/service/passport-login-web-login-sms";
import { passportLoginWebSmsSend } from "@/service/passport-login-web-sms-send";

interface CodeLoginForm {
  phone: string;
  code: string;
}

const PHONE_REGEX_CN = /^(?:\+?86)?1\d{10}$/; // 简易中国大陆手机号校验

interface Props {
  onClose: () => void;
  updateUserData: (refreshToken?: string) => Promise<void>;
}

const CodeLogin = ({ onClose, updateUserData }: Props) => {
  const [countryId, setCountryId] = useState<string>("1");
  const codeRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      phoneRef.current?.focus();
    });

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const getDefaultCountry = async () => {
      const res = await getPassportLoginDefaultCountry();

      if (res?.data?.default?.id) {
        setCountryId(String(res.data.default.id));
      }
    };

    getDefaultCountry();
  }, []);

  const { data: countryList } = useRequest(async () => {
    const res = await getGenericCountryList();

    return res?.data?.common || [];
  });

  const { verify, loading: geetestLoading } = useGeetest();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    getValues,
    trigger,
  } = useForm<CodeLoginForm>({
    mode: "onChange",
    defaultValues: { phone: "", code: "" },
  });

  const [captchaKey, setCaptchaKey] = useState<string>("");
  const [countdown, setCountdown] = useState<number>(0);
  const [sending, setSending] = useState(false);

  // 倒计时逻辑保持不变
  useEffect(() => {
    let timer: number | null = null;
    if (countdown > 0) {
      timer = window.setInterval(() => setCountdown(v => (v > 0 ? v - 1 : 0)), 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [countdown]);

  const onSendCode = async () => {
    const phone = getValues("phone");
    const isPhoneValid = await trigger("phone");

    if (!isPhoneValid || !phone) {
      return;
    }

    setSending(true);
    try {
      // 1. Geetest Verification
      const gtResult = await verify();
      if (!gtResult) return;

      // 2. Send SMS
      const tel = Number(phone.replace(/\D/g, ""));
      const countryCode = countryList?.find(item => item.id === Number(countryId))?.country_id || "86";
      const res = await passportLoginWebSmsSend({
        cid: Number(countryCode),
        tel,
        source: "main_web",
        token: gtResult.token,
        challenge: gtResult.challenge,
        validate: gtResult.validate,
        seccode: gtResult.seccode,
      });

      if (res.code === 0) {
        setCaptchaKey(res.data?.captcha_key || "");
        addToast({ title: "验证码已发送", color: "success" });
        setCountdown(60);
        setTimeout(() => {
          codeRef.current?.focus();
        });
      } else {
        addToast({ title: res.message || "验证码发送失败", color: "danger" });
      }
    } catch (e: any) {
      addToast({ title: e?.message || "网络异常，稍后重试", color: "danger" });
    } finally {
      setSending(false);
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

      const countryCode = countryList?.find(item => item.id === Number(countryId))?.country_id || "86";
      const resp = await getPassportLoginWebLoginSms({
        cid: Number(countryCode),
        tel,
        code,
        source: "main_web",
        captcha_key: captchaKey,
        keep: true,
      });

      if (resp.code === 0) {
        addToast({ title: "登录成功", color: "success" });
        await updateUserData(resp.data?.refresh_token);
        onClose();
      } else {
        addToast({ title: resp.message || "登录失败", color: "danger" });
      }
    } catch (e: any) {
      addToast({ title: e?.message || "网络异常，稍后重试", color: "danger" });
    }
  };

  return (
    <form className="flex w-full flex-col gap-4" onSubmit={handleSubmit(onSubmitCodeLogin)}>
      <Controller
        control={control}
        name="phone"
        rules={{
          required: "请输入手机号",
          validate: value => {
            if (countryId === "1" && !PHONE_REGEX_CN.test(value)) {
              return "手机号格式不正确";
            }
            return true;
          },
        }}
        render={({ field }) => (
          <Input
            {...field}
            ref={e => {
              field.ref(e);
              phoneRef.current = e;
            }}
            name="phone"
            type="tel"
            placeholder="请输入手机号"
            variant="bordered"
            isClearable
            autoComplete="tel"
            isInvalid={!!errors.phone}
            errorMessage={errors.phone?.message}
            classNames={{
              inputWrapper: "pl-0",
            }}
            startContent={
              <Select
                variant="bordered"
                disallowEmptySelection
                disableAnimation
                items={countryList || []}
                className="w-[140px]"
                popoverProps={{
                  portalContainer: document.body,
                  placement: "bottom-start",
                  style: {
                    width: "auto",
                  },
                }}
                classNames={{
                  popoverContent: "w-auto",
                  listbox: "w-max",
                  listboxWrapper: "w-auto",
                  trigger: "border-none",
                }}
                selectedKeys={[countryId]}
                onChange={e => {
                  setCountryId(e.target.value);
                }}
                aria-label="选择国家/地区"
              >
                {country => (
                  <SelectItem key={country.id} textValue={`+${country.country_id}`}>
                    {country.cname}(+{country.country_id})
                  </SelectItem>
                )}
              </Select>
            }
          />
        )}
      />

      <div className="flex items-start gap-2">
        <Controller
          control={control}
          name="code"
          rules={{
            required: "请输入验证码",
            pattern: { value: /^\d{6}$/, message: "验证码必须为6位数字" },
          }}
          render={({ field }) => (
            <Input
              {...field}
              ref={e => {
                field.ref(e);
                codeRef.current = e;
              }}
              className="flex-1"
              type="text"
              placeholder="验证码"
              variant="bordered"
              isInvalid={!!errors.code}
              errorMessage={errors.code?.message}
            />
          )}
        />
        <Button
          type="button"
          variant="flat"
          isDisabled={countdown > 0 || sending || geetestLoading}
          isLoading={sending || geetestLoading}
          onPress={onSendCode}
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
