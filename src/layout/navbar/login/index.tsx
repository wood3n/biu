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
import { JSEncrypt } from "jsencrypt";
import { QRCodeCanvas } from "qrcode.react";

import { getPassportLoginWebKey } from "@/service/passport-login-web-key";
import { postPassportLoginWebLoginPassword } from "@/service/passport-login-web-login-passport";
import { getPassportLoginWebQrcodeGenerate } from "@/service/passport-login-web-qrcode-generate";
import { getPassportLoginWebQrcodePoll } from "@/service/passport-login-web-qrcode-poll";

interface PasswordLoginForm {
  phone: string;
  password: string;
}

const PHONE_REGEX_CN = /^(?:\+?86)?1\d{10}$/; // 简易中国大陆手机号校验

const Login = () => {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const [activeKey, setActiveKey] = useState<string>("password");

  // ===== 手机号+密码 登录表单 =====
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
    if (!isOpen) {
      // 关闭弹窗时重置表单与状态
      reset({ phone: "", password: "" });
      setActiveKey("password");
      setPwdVisible(false);
    }
  }, [isOpen, reset]);

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
              <Tab key="password" title="手机号登录">
                <form className="mt-2 space-y-4" onSubmit={handleSubmit(onSubmitPasswordLogin)}>
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

                  <Controller
                    control={control}
                    name="password"
                    rules={{ required: "请输入密码", minLength: { value: 6, message: "密码至少6位" } }}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type={isPwdVisible ? "text" : "password"}
                        label="密码"
                        placeholder="请输入密码"
                        value={field.value}
                        onValueChange={val => field.onChange(val)}
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
                            {isPwdVisible ? "隐藏" : "显示"}
                          </Button>
                        }
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
