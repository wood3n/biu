/**
 * 接口响应
 */
type APIResponse<T> = T & {
  code: number;
}

/**
 * 一般响应
 */
type APIResponseData<T> = APIResponse<{ data: T }>

/**
 * 嵌套响应
 */
type APIResponseNestData<T> = {
  data: T & {
    code: number;
  }
}