/**
 * Dataverse HTTP Client
 * Implementation of HTTP client for Dataverse API
 * Follows Dependency Inversion Principle
 */

import { IHttpClient, IAuthProvider } from '../interfaces/IHttpClient';
import { AppConfig } from '../config/app.config';

export class DataverseHttpClient implements IHttpClient {
  constructor(private authProvider: IAuthProvider) {}

  private async getHeaders(customHeaders?: Record<string, string>): Promise<HeadersInit> {
    const token = await this.authProvider.getToken();
    
    return {
      'Authorization': `Bearer ${token}`,
      'OData-MaxVersion': '4.0',
      'OData-Version': '4.0',
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...customHeaders,
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ HTTP Error:', response.status, errorText);
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  async get<T>(url: string, customHeaders?: Record<string, string>): Promise<T> {
    const headers = await this.getHeaders({
      'Prefer': 'odata.include-annotations="*"',
      ...customHeaders,
    });
    
    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    return this.handleResponse<T>(response);
  }

  async post<T>(url: string, data: any, customHeaders?: Record<string, string>): Promise<T> {
    const headers = await this.getHeaders({
      'Prefer': 'return=representation',
      ...customHeaders,
    });
    
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    return this.handleResponse<T>(response);
  }

  async patch<T>(url: string, data: any, customHeaders?: Record<string, string>): Promise<T> {
    const headers = await this.getHeaders(customHeaders);
    
    const response = await fetch(url, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(data),
    });

    return this.handleResponse<T>(response);
  }
}
