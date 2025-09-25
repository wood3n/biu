import { getPassportLoginWebCookieInfo } from "@/service/passport-login-web-cookie-info";

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

    const htmlRes = await fetch(`https://www.bilibili.com/correspond/1/${correspondPath}`, {
      method: "GET",
      credentials: "include",
    });

    if (htmlRes.ok) {
      const html = await htmlRes.text();
      console.log(html);
    }
  }
};
