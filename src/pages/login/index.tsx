import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useRequest } from "ahooks";
import { addToast, Image } from "@heroui/react";

import { ImageErr } from "@/common/constants";
import { checkError } from "@/common/utils";
import { getLoginQrCheck, getLoginQrCreate, getLoginQrKey } from "@/service";

import { QRLoginCode } from "./constants";

const LoginByQr: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [src, setSrc] = useState<string>();

  const createQr = async () => {
    setLoading(true);
    try {
      const { data } = await getLoginQrKey();
      const { data: qrData } = await getLoginQrCreate({
        key: data.unikey,
        qrimg: true,
      });
      setSrc(qrData.qrimg);
      return data.unikey;
    } catch (err) {
      return Promise.reject(err);
    } finally {
      setLoading(false);
    }
  };

  const { runAsync, cancel } = useRequest(getLoginQrCheck, {
    manual: true,
    pollingInterval: 3000,
    onSuccess: ({ code }) => {
      if (code === QRLoginCode.Success) {
        cancel();
        addToast({
          title: "登录成功",
          color: "success",
        });
        navigate("/recommend", { replace: true });
      }

      if (code === QRLoginCode.Timeout) {
        cancel();
      }
    },
  });

  async function checkLogin() {
    try {
      const key = await createQr();
      if (key) {
        runAsync({ key });
      }
    } catch (err) {
      checkError(err);
    }
  }

  useEffect(() => {
    checkLogin();
  }, []);

  useEffect(() => cancel, [cancel]);

  return (
    <div className="flex h-full w-full items-center justify-center">
      <Image isLoading={loading} width={180} fallbackSrc={ImageErr} src={src} />
    </div>
  );
};

export default LoginByQr;
