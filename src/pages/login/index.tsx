import React from "react";
import { useNavigate } from "react-router";

import { addToast, Alert, Card, CardBody, CardHeader, Skeleton } from "@heroui/react";
import { useRequest } from "ahooks";
import { QRCodeSVG } from "qrcode.react";

import { getPassportLoginWebQrcodeGenerate } from "@/service/passport-login-web-qrcode-generate";
import { getPassportLoginWebQrcodePoll } from "@/service/passport-login-web-qrcode-poll";

import { QRLoginCode, QRLoginCodeMap, QRLoginStatusColorMap } from "./constants";

const Login = () => {
  const navigate = useNavigate();

  const {
    data: qrStatus,
    runAsync: checkLoginStatus,
    cancel,
  } = useRequest(
    async (qrcodeKey: string) => {
      const res = await getPassportLoginWebQrcodePoll({ qrcode_key: qrcodeKey });
      console.log("getPassportLoginWebQrcodePoll>>>>", res);

      if (res?.code === 0) {
        switch (res.data?.code) {
          case QRLoginCode.Timeout:
            cancel();
            break;
          case QRLoginCode.Success:
            cancel();
            addToast({
              title: "登录成功",
              color: "success",
            });
            navigate("/", { replace: true });
            break;
          default:
            break;
        }

        return res?.data?.code;
      }

      return null;
    },
    {
      manual: true,
      pollingInterval: 3000,
      pollingWhenHidden: true,
    },
  );

  const { data: loginData } = useRequest(async () => {
    const res = await getPassportLoginWebQrcodeGenerate();

    if (res?.code === 0 && res?.data) {
      checkLoginStatus(res.data.qrcode_key);
      return res?.data;
    } else {
      return null;
    }
  });

  return (
    <div className="flex h-full w-full flex-col items-center justify-center">
      <Card className="w-96 max-w-full">
        <CardHeader className="flex justify-center pb-0">
          <h2 className="text-xl font-bold">扫码登录</h2>
        </CardHeader>
        <CardBody className="items-center gap-4">
          {loginData?.url ? (
            <QRCodeSVG value={loginData.url} />
          ) : (
            <Skeleton className="rounded-lg">
              <div className="bg-default-300 h-24 w-24 rounded-lg" />
            </Skeleton>
          )}
        </CardBody>
      </Card>
      {Boolean(qrStatus) && (
        <div className="mt-4">
          <Alert
            color={QRLoginStatusColorMap[qrStatus as QRLoginCode]}
            title={QRLoginCodeMap[qrStatus as QRLoginCode]}
          />
        </div>
      )}
    </div>
  );
};

export default Login;
