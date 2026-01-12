/**
 * Auth Provider Implementation
 * Wrapper around authentication service
 */

import { IAuthProvider } from '../interfaces/IHttpClient';
import { getToken } from '../implicitAuthService';

export class AuthProvider implements IAuthProvider {
  async getToken(): Promise<string> {
    return getToken();
  }
}
