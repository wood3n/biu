import { Button, addToast, Skeleton } from "@heroui/react";
import { RiRefreshLine } from "@remixicon/react";
import { useRequest } from "ahooks";
import clx from "classnames";
import { QRCodeCanvas } from "qrcode.react";

import { getUrlParams } from "@/common/utils/url";
import { getPassportLoginWebQrcodeGenerate } from "@/service/passport-login-web-qrcode-generate";
import { getPassportLoginWebQrcodePoll } from "@/service/passport-login-web-qrcode-poll";
import { useToken } from "@/store/token";
import { useUser } from "@/store/user";

type QrcodeLoginProps = {
  onClose: () => void;
};

const QrcodeLogin = ({ onClose }: QrcodeLoginProps) => {
  const { updateUser } = useUser();
  const { updateToken } = useToken();

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
      onSuccess: pollData => {
        if (pollData?.code === 0) {
          updateUser();

          const { refresh_token, timestamp, url } = pollData;

          const urlParams = getUrlParams(url || "");

          updateToken({
            refresh_token,
            timestamp,
            url,
            ...urlParams,
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
      <h2 className="mb-4">扫码登录</h2>
      <div className="border-divider bg-content1 relative flex h-48 w-48 items-center justify-center overflow-hidden rounded-lg border">
        {genLoading || !qrcodeData?.url ? (
          <Skeleton className="rounded-lg">
            <div className="bg-default-300 h-[176px] w-[176px] rounded-lg" />
          </Skeleton>
        ) : (
          <QRCodeCanvas value={qrcodeData?.url} size={176} className="rounded-md" />
        )}
        <div
          className={clx(
            "absolute top-0 right-0 h-full w-full flex-col items-center justify-center bg-gray-300/30 transition",
            {
              hidden: !isOvertime,
              flex: isOvertime,
            },
          )}
        >
          <Button isLoading={genLoading} isIconOnly variant="flat" onPress={refreshCode}>
            <RiRefreshLine className="text-primary" />
          </Button>
          {isOvertime && <p className="mt-2 text-center text-sm text-black">二维码已失效，请刷新</p>}
        </div>
      </div>
    </div>
  );
};

export default QrcodeLogin;
