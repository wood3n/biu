import { passportRequest } from "./request";

/**
 * 获取国际冠字码_web端接口响应类型
 */
export interface CountryListResponse {
  code: number; // 返回值，0表示成功
  data: {
    default: CountryInfo; // 常用国家&地区
    list: CountryInfo[]; // 所有国家&地区
  };
}

/**
 * 国家&地区信息
 */
export interface CountryInfo {
  id: number; // 国际代码值
  cname: string; // 国家&地区名
  country_code: string; // 国家&地区区号
}

/**
 * 获取默认地区冠字号
 * @returns 国际冠字码列表
 */
export function getPassportLoginDefaultCountry(): Promise<CountryListResponse> {
  return passportRequest.get("/x/passport-login/web/country");
}
