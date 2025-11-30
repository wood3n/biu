import { postPassportLoginWebConfirmRefresh } from "@/service/passport-login-web-confirm-refresh";
import { getPassportLoginWebCookieInfo } from "@/service/passport-login-web-cookie-info";
import { postPassportLoginWebCookieRefresh } from "@/service/passport-login-web-cookie-refresh";
import { biliRequest } from "@/service/request";
import { useToken } from "@/store/token";

async function getCorrespondPath(timestamp: number, publicKey: CryptoKey) {
  const data = new TextEncoder().encode(`refresh_${timestamp}`);
  const encrypted = new Uint8Array(await crypto.subtle.encrypt({ name: "RSA-OAEP" }, publicKey, data));
  return encrypted.reduce((str, c) => str + c.toString(16).padStart(2, "0"), "");
}

async function getPublicKey() {
  return crypto.subtle.importKey(
    "jwk",
    {
      kty: "RSA",
      n: "y4HdjgJHBlbaBN04VERG4qNBIFHP6a3GozCl75AihQloSWCXC5HDNgyinEnhaQ_4-gaMud_GF50elYXLlCToR9se9Z8z433U3KjM-3Yx7ptKkmQNAMggQwAVKgq3zYAoidNEWuxpkY_mAitTSRLnsJW-NCTa0bqBFF6Wm1MxgfE",
      e: "AQAB",
    },
    { name: "RSA-OAEP", hash: "SHA-256" },
    true,
    ["encrypt"],
  );
}

export const refreshCookie = async () => {
  const res = await getPassportLoginWebCookieInfo();
  if (res?.data?.refresh) {
    const timestamp = res?.data?.timestamp;
    const publicKey = await getPublicKey();
    const correspondPath = await getCorrespondPath(timestamp, publicKey);

    const htmlRes = await biliRequest.get<string>(`/correspond/1/${correspondPath}`, {
      responseType: "text",
    });

    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlRes, "text/html");
    const targetDiv = doc.getElementById("1-name");

    if (targetDiv && targetDiv.textContent) {
      const refreshCSRF = targetDiv.textContent.trim();
      const oldRefreshToken = useToken.getState().tokenData?.refresh_token as string;

      const getRefreshCookieRes = await postPassportLoginWebCookieRefresh({
        refresh_csrf: refreshCSRF,
        source: "main_web",
        refresh_token: oldRefreshToken,
      });

      if (getRefreshCookieRes.code === 0) {
        // 如果刷新成功，这一步会通过 set-cookie 注入新的 cookie
        const newRefreshToken = getRefreshCookieRes.data?.refresh_token;

        useToken.setState({
          tokenData: {
            ...useToken.getState().tokenData,
            refresh_token: newRefreshToken,
          },
        });

        const getRefreshResult = await postPassportLoginWebConfirmRefresh({
          refresh_token: oldRefreshToken,
        });

        return getRefreshResult.code === 0;
      }

      return false;
    } else {
      return false;
    }
  }

  return false;
};
