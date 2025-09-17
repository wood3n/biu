import { useEffect, useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";

import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  Spinner,
  Tab,
  Tabs,
  addToast,
  useDisclosure,
} from "@heroui/react";
import { QRCodeCanvas } from "qrcode.react";

import { getPassportLoginWebLoginSms } from "@/service/passport-login-web-login-sms";
import { getPassportLoginWebQrcodeGenerate } from "@/service/passport-login-web-qrcode-generate";
import { getPassportLoginWebQrcodePoll } from "@/service/passport-login-web-qrcode-poll";
import { getPassportLoginWebSmsSend } from "@/service/passport-login-web-sms-send";

interface SmsLoginForm {
  phone: string;
  code: string;
}

const PHONE_REGEX_CN = /^(?:\+?86)?1\d{10}$/; // 简易中国大陆手机号校验

const Login = () => {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const [activeKey, setActiveKey] = useState<string>("sms");

  // ===== 短信登录表单 =====
  const {
    control,
    handleSubmit,
    trigger,
    formState: { errors, isSubmitting },
    reset,
    getValues,
  } = useForm<SmsLoginForm>({
    mode: "onChange",
    defaultValues: { phone: "", code: "" },
  });

  const [countdown, setCountdown] = useState<number>(0); // 获取验证码倒计时（秒）
  const [sendingCode, setSendingCode] = useState<boolean>(false);
  const [captchaKey, setCaptchaKey] = useState<string>(""); // 短信登录 token

  useEffect(() => {
    if (!isOpen) {
      // 关闭弹窗时重置表单与状态
      reset({ phone: "", code: "" });
      setCountdown(0);
      setSendingCode(false);
      setCaptchaKey("");
      setActiveKey("sms");
    }
  }, [isOpen, reset]);

  useEffect(() => {
    if (countdown <= 0) return;
    const id = setInterval(() => {
      setCountdown(v => (v > 0 ? v - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, [countdown]);

  const requestSmsCode = async () => {
    // 触发手机号校验
    const ok = await trigger("phone");
    if (!ok) return;

    try {
      setSendingCode(true);
      // 使用表单的当前值
      const purePhone = (getValues("phone") || "").replace(/\D/g, "");

      const resp = await getPassportLoginWebSmsSend({
        cid: 86,
        tel: Number(purePhone),
        source: "main_web",
        token: "", // 未接入极验，暂置空
        challenge: "",
        validate: "",
        seccode: "",
      });

      if (resp.code === 0) {
        setCaptchaKey(resp.data.captcha_key);
        addToast({ title: "验证码已发送", color: "success" });
        setCountdown(60);
      } else {
        addToast({ title: resp.message || "发送失败", color: "danger" });
      }
    } catch (e: any) {
      addToast({ title: e?.message || "网络异常，稍后重试", color: "danger" });
    } finally {
      setSendingCode(false);
    }
  };

  const onSubmitSmsLogin = async (values: SmsLoginForm) => {
    try {
      const tel = Number(values.phone.replace(/\D/g, ""));
      const code = Number(values.code.trim());
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
        setTimeout(() => onClose(), 600);
      } else {
        addToast({ title: resp.message || "登录失败", color: "danger" });
      }
    } catch (e: any) {
      addToast({ title: e?.message || "网络异常，稍后重试", color: "danger" });
    }
  };

  // ===== 生成二维码 =====
  const [genData, setGenData] = useState<any>(null);
  const [genLoading, setGenLoading] = useState<boolean>(false);

  const runGenerate = async () => {
    try {
      setGenLoading(true);
      const data = await getPassportLoginWebQrcodeGenerate();
      setGenData(data);
    } finally {
      setGenLoading(false);
    }
  };

  const qrcodeKey = genData?.data?.qrcode_key ?? "";
  const qrcodeUrl = genData?.data?.url ?? "";

  // ===== 轮询扫码状态 =====
  const [pollData, setPollData] = useState<any>(null);
  const [pollTimer, setPollTimer] = useState<number | null>(null);

  const runPoll = async () => {
    if (!qrcodeKey) return;
    const tick = async () => {
      try {
        const res = await getPassportLoginWebQrcodePoll({ qrcode_key: qrcodeKey });
        setPollData(res);
      } catch {
        // ignore
      }
    };
    await tick();
    const id = window.setInterval(tick, 1500);
    setPollTimer(id);
  };

  const cancelPoll = () => {
    if (pollTimer) {
      clearInterval(pollTimer);
      setPollTimer(null);
    }
  };

  // 控制二维码获取与轮询
  useEffect(() => {
    if (!isOpen || activeKey !== "qrcode") return;
    if (!qrcodeKey) runGenerate();
  }, [isOpen, activeKey]);

  useEffect(() => {
    if (!qrcodeKey || activeKey !== "qrcode" || !isOpen) return;
    runPoll();
    return () => cancelPoll();
  }, [qrcodeKey, activeKey, isOpen]);

  // 根据状态展示提示
  const qrStatus = useMemo(() => {
    const code = pollData?.data?.code;
    if (!pollData) return { text: "请使用B站 App 扫码登录", type: "info" as const };
    if (code === 86101) return { text: "等待扫码...", type: "info" as const };
    if (code === 86090) return { text: "已扫码，请在手机确认", type: "warning" as const };
    if (code === 86038) return { text: "二维码已失效，请刷新", type: "danger" as const };
    if (code === 0) return { text: "登录成功，即将关闭", type: "success" as const };
    return { text: pollData?.data?.message || "", type: "info" as const };
  }, [pollData]);

  // 登录成功自动关闭（扫码）
  useEffect(() => {
    if (pollData?.data?.code === 0) {
      addToast({ title: "登录成功", color: "success" });
      setTimeout(() => onClose(), 800);
    }
  }, [pollData]);

  const onRefreshQrcode = () => {
    cancelPoll();
    setGenData(null);
    setPollData(null);
    runGenerate();
  };

  return (
    <>
      <Button color="primary" variant="flat" onPress={onOpen}>
        登录
      </Button>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange} backdrop="opaque" size="lg">
        <ModalContent>
          <ModalHeader className="flex flex-col items-start gap-1">
            <span className="text-base font-semibold">登录</span>
          </ModalHeader>
          <ModalBody className="gap-0">
            <Tabs
              fullWidth
              aria-label="登录方式"
              variant="solid"
              selectedKey={activeKey}
              onSelectionChange={key => setActiveKey(String(key))}
            >
              <Tab key="sms" title="手机号登录">
                <form className="mt-2 space-y-4" onSubmit={handleSubmit(onSubmitSmsLogin)}>
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
                        endContent={
                          <Button
                            size="sm"
                            variant="flat"
                            className="min-w-24"
                            isDisabled={sendingCode || countdown > 0}
                            isLoading={sendingCode}
                            onPress={requestSmsCode}
                            type="button"
                          >
                            {countdown > 0 ? `${countdown}s` : "获取验证码"}
                          </Button>
                        }
                      />
                    )}
                  />

                  <Controller
                    control={control}
                    name="code"
                    rules={{ required: "请输入短信验证码", minLength: { value: 4, message: "验证码至少4位" } }}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="text"
                        label="验证码"
                        placeholder="请输入短信验证码"
                        value={field.value}
                        onValueChange={val => field.onChange(val.replace(/\D/g, ""))}
                        variant="bordered"
                        maxLength={6}
                        inputMode="numeric"
                        isInvalid={!!errors.code}
                        errorMessage={errors.code?.message as string}
                      />
                    )}
                  />

                  <Button
                    color="primary"
                    className="w-full"
                    type="submit"
                    isDisabled={isSubmitting}
                    isLoading={isSubmitting}
                  >
                    登录
                  </Button>
                </form>
              </Tab>

              <Tab key="qrcode" title="二维码登录">
                <div className="mt-2 flex flex-col items-center gap-3">
                  <div className="border-divider bg-content1 relative flex h-48 w-48 items-center justify-center rounded-lg border">
                    {genLoading || !qrcodeUrl ? (
                      <Spinner label="加载二维码..." color="primary" />
                    ) : (
                      <QRCodeCanvas value={qrcodeUrl} size={176} includeMargin className="rounded-md" />
                    )}
                  </div>
                  <div className="text-tiny text-foreground-500">{qrStatus.text}</div>
                  <div className="flex items-center gap-3">
                    <Button size="sm" variant="flat" onPress={onRefreshQrcode}>
                      刷新二维码
                    </Button>
                    {pollData?.data?.code === 0 && (
                      <Button size="sm" color="primary" onPress={onClose}>
                        关闭
                      </Button>
                    )}
                  </div>
                </div>
              </Tab>
            </Tabs>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default Login;
