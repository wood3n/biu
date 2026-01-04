import { Button, addToast, Skeleton } from "@heroui/react";
import { RiRefreshLine } from "@remixicon/react";
import { useRequest } from "ahooks";
import clx from "classnames";
import { QRCodeCanvas } from "qrcode.react";

import { getPassportLoginWebQrcodeGenerate } from "@/service/passport-login-web-qrcode-generate";
import { getPassportLoginWebQrcodePoll } from "@/service/passport-login-web-qrcode-poll";

type QrcodeLoginProps = {
  onClose: () => void;
  updateUserData: (refreshToken?: string) => Promise<void>;
};

const QrcodeLogin = ({ onClose, updateUserData }: QrcodeLoginProps) => {
  const {
    loading: genLoading,
    data: qrcodeData,
    refreshAsync: refreshCode,
  } = useRequest(async () => {
    const data = await getPassportLoginWebQrcodeGenerate();
    return data?.data;
  });

  const { data: pollData, cancel: cancelPoll } = useRequest(
    async () => {
      const res = await getPassportLoginWebQrcodePoll({ qrcode_key: qrcodeData?.qrcode_key as string });

      return res?.data;
    },
    {
      ready: Boolean(qrcodeData?.qrcode_key),
      refreshDeps: [qrcodeData?.qrcode_key],
      pollingInterval: 2000,
      pollingWhenHidden: false,
      onSuccess: async pollData => {
        if (pollData?.code === 0) {
          const { refresh_token } = pollData;

          await updateUserData(refresh_token);

          addToast({ title: "登录成功", color: "success" });
          onClose();
          cancelPoll();
        }

        if (pollData?.code === 86038) {
          cancelPoll();
        }
      },
    },
  );

  const isOvertime = pollData?.code === 86038;
  const isPendingConfirm = pollData?.code === 86090 || pollData?.code === 0;

  return (
    <div className="flex flex-col items-center p-6">
      <div className="mb-4 text-lg font-medium">扫码登录</div>
      <div className="border-divider bg-content1 relative flex h-40 w-40 items-center justify-center overflow-hidden rounded-lg border">
        {genLoading || !qrcodeData?.url ? (
          <Skeleton className="rounded-lg">
            <div className="bg-default-300 h-[144px] w-[144px] rounded-lg" />
          </Skeleton>
        ) : (
          <QRCodeCanvas value={qrcodeData?.url} size={144} className="rounded-md" />
        )}
        <div
          className={clx(
            "absolute top-0 right-0 h-full w-full flex-col items-center justify-center bg-black/70 transition",
            {
              hidden: !isOvertime,
              flex: isOvertime,
            },
          )}
        >
          <Button isLoading={genLoading} isIconOnly color="primary" variant="solid" onPress={refreshCode}>
            <RiRefreshLine />
          </Button>
          {isOvertime && <p className="mt-2 text-center text-sm font-bold text-white">二维码已失效，请刷新</p>}
        </div>
      </div>
      <p
        className={clx("text-default-500 dark:text-default-400 mt-2 text-sm whitespace-nowrap", {
          "text-warning-500 dark:text-warning-400": isPendingConfirm,
        })}
      >
        {isPendingConfirm ? "二维码已扫码未确认" : "请使用bilibili手机客户端扫码登录"}
      </p>
    </div>
  );
};

export default QrcodeLogin;
