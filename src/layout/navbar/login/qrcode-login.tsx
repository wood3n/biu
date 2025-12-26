import { Button, addToast, Skeleton } from "@heroui/react";
import { RiRefreshLine } from "@remixicon/react";
import { useRequest } from "ahooks";
import clx from "classnames";
import moment from "moment";
import { QRCodeCanvas } from "qrcode.react";

import { getPassportLoginWebQrcodeGenerate } from "@/service/passport-login-web-qrcode-generate";
import { getPassportLoginWebQrcodePoll } from "@/service/passport-login-web-qrcode-poll";
import { useToken } from "@/store/token";
import { useUser } from "@/store/user";

type QrcodeLoginProps = {
  onClose: () => void;
};

const QrcodeLogin = ({ onClose }: QrcodeLoginProps) => {
  const updateUser = useUser(state => state.updateUser);
  const updateToken = useToken(state => state.updateToken);

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
          try {
            await updateUser();
          } catch (error) {
            console.error("[qrcode-login] 更新用户信息失败:", error);
          }

          const { refresh_token } = pollData;

          updateToken({
            tokenData: { refresh_token },
            nextCheckRefreshTime: moment().add(2, "days").unix(),
          });

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

  return (
    <div className="flex flex-col items-center p-6">
      <div className="text-foreground mb-4 text-lg font-medium">扫码登录</div>
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
      <p className="text-default-500 dark:text-default-400 mt-4 text-sm whitespace-nowrap">
        请使用bilibili手机客户端扫码登录
      </p>
    </div>
  );
};

export default QrcodeLogin;
