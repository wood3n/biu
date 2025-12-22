import { useCallback, useEffect, useState } from "react";

import { getPassportLoginCaptcha } from "@/service/passport-login-captcha";

import { loadGeetestScript, verifyGeetest, type GeetestResult } from "../utils/geetest";

export const useGeetest = () => {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadGeetestScript().catch(console.error);
  }, []);

  const verify = useCallback(async (): Promise<GeetestResult | null> => {
    setLoading(true);
    try {
      return await verifyGeetest(getPassportLoginCaptcha);
    } finally {
      setLoading(false);
    }
  }, []);

  return { verify, loading };
};
