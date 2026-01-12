/**
 * HTTP Client Interface
 * Abstraction cho HTTP requests
 */

export interface IHttpClient {
  get<T>(url: string, headers?: Record<string, string>): Promise<T>;
  post<T>(url: string, data: any, headers?: Record<string, string>): Promise<T>;
  patch<T>(url: string, data: any, headers?: Record<string, string>): Promise<T>;
}

export interface IAuthProvider {
  getToken(): Promise<string>;
}
