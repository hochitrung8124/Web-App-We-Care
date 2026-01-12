/**
 * 🧪 DEMO & TESTING UTILITIES
 * Các function tiện ích để test authentication trong console
 */

import { 
  saveTokenManually, 
  getStoredToken, 
  getStoredUser, 
  isTokenValid,
  clearToken,
  logout,
  type UserInfo 
} from './implicitAuthService';

/**
 * Test token validity
 */
export const testToken = () => {
  console.log('🔍 Testing token...');
  console.log('Valid:', isTokenValid());
  console.log('Token:', getStoredToken());
  console.log('User:', getStoredUser());
};

/**
 * Clear all auth data
 */
export const clearAuth = () => {
  console.log('🧹 Clearing auth data...');
  clearToken();
  console.log('✅ Auth data cleared');
};

/**
 * Demo: Parse và lưu token thủ công
 * @example
 * demoSaveToken('eyJ0eXAiOiJKV1Qi...')
 */
export const demoSaveToken = (token: string) => {
  try {
    console.log('💾 Saving token...');
    const result = saveTokenManually(token);
    console.log('✅ Token saved successfully!');
    console.log('User info:', result.user);
    console.log('Expires in:', result.expiresIn, 'seconds');
    console.log('Expires at:', new Date(Date.now() + result.expiresIn * 1000).toLocaleString('vi-VN'));
    return result;
  } catch (error) {
    console.error('❌ Error saving token:', error);
    throw error;
  }
};

/**
 * Demo: Tạo mock user cho testing (không cần real token)
 */
export const createMockAuth = () => {
  console.log('🎭 Creating mock authentication...');
  
  // Tạo một JWT token giả (CHỈ ĐỂ DEMO UI - không dùng được để call API)
  const mockUser: UserInfo = {
    username: 'demo@wecare.com',
    name: 'Nguyễn Văn Demo',
    email: 'demo@wecare.com'
  };

  const mockToken = 'mock_token_for_ui_demo_only';
  const expiryTime = Date.now() + 3600 * 1000; // 1 hour

  localStorage.setItem('dynamics_access_token', mockToken);
  localStorage.setItem('dynamics_token_expiry', expiryTime.toString());
  localStorage.setItem('dynamics_user_info', JSON.stringify(mockUser));

  console.log('✅ Mock auth created!');
  console.log('⚠️ WARNING: This is for UI testing only. Cannot call real APIs.');
  console.log('Mock user:', mockUser);
  
  return { user: mockUser, token: mockToken };
};

/**
 * Inspect JWT token (decode và hiển thị nội dung)
 */
export const inspectToken = (token?: string) => {
  try {
    const targetToken = token || getStoredToken();
    if (!targetToken) {
      console.error('❌ No token found');
      return null;
    }

    console.log('🔍 Inspecting JWT token...');
    
    const parts = targetToken.split('.');
    if (parts.length !== 3) {
      console.error('❌ Invalid JWT format');
      return null;
    }

    // Decode header
    const header = JSON.parse(atob(parts[0].replace(/-/g, '+').replace(/_/g, '/')));
    console.log('📋 Header:', header);

    // Decode payload
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    console.log('📦 Payload:', payload);

    // Check expiry
    if (payload.exp) {
      const expiryDate = new Date(payload.exp * 1000);
      const now = new Date();
      const isExpired = expiryDate < now;
      
      console.log('⏰ Issued at:', new Date(payload.iat * 1000).toLocaleString('vi-VN'));
      console.log('⌛ Expires at:', expiryDate.toLocaleString('vi-VN'));
      console.log('🔄 Status:', isExpired ? '❌ EXPIRED' : '✅ VALID');
      
      if (!isExpired) {
        const remainingMinutes = Math.floor((expiryDate.getTime() - now.getTime()) / 1000 / 60);
        console.log(`⏱️ Remaining: ${remainingMinutes} minutes`);
      }
    }

    console.log('\n👤 User Info:');
    console.log('  Name:', payload.name);
    console.log('  Email:', payload.upn || payload.email);
    console.log('  Username:', payload.unique_name);

    return { header, payload };
  } catch (error) {
    console.error('❌ Error inspecting token:', error);
    return null;
  }
};

/**
 * Get auth status summary
 */
export const getAuthStatus = () => {
  const isValid = isTokenValid();
  const user = getStoredUser();
  const token = getStoredToken();
  const expiry = localStorage.getItem('dynamics_token_expiry');

  console.log('\n📊 Auth Status Summary');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔐 Authenticated:', isValid ? '✅ YES' : '❌ NO');
  console.log('👤 User:', user?.name || 'N/A');
  console.log('📧 Email:', user?.email || 'N/A');
  console.log('🎫 Token:', token ? `${token.substring(0, 20)}...` : 'N/A');
  
  if (expiry) {
    const expiryDate = new Date(parseInt(expiry));
    const now = new Date();
    const remainingMinutes = Math.floor((expiryDate.getTime() - now.getTime()) / 1000 / 60);
    
    console.log('⏰ Expires:', expiryDate.toLocaleString('vi-VN'));
    console.log('⏱️ Remaining:', remainingMinutes > 0 ? `${remainingMinutes} minutes` : '❌ EXPIRED');
  }
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  return {
    isValid,
    user,
    hasToken: !!token,
    expiryDate: expiry ? new Date(parseInt(expiry)) : null
  };
};

// Export all utilities
export const AuthDemo = {
  testToken,
  clearAuth,
  demoSaveToken,
  createMockAuth,
  inspectToken,
  getAuthStatus,
  logout
};

// Make available in console (development only)
if (typeof window !== 'undefined') {
  (window as any).AuthDemo = AuthDemo;
  console.log('🎮 Auth Demo utilities loaded!');
  console.log('📝 Available commands:');
  console.log('  - AuthDemo.getAuthStatus()    - Xem trạng thái auth');
  console.log('  - AuthDemo.inspectToken()     - Phân tích JWT token');
  console.log('  - AuthDemo.testToken()        - Test token validity');
  console.log('  - AuthDemo.createMockAuth()   - Tạo mock user (UI test)');
  console.log('  - AuthDemo.clearAuth()        - Xóa auth data');
  console.log('  - AuthDemo.logout()           - Đăng xuất');
  console.log('  - AuthDemo.demoSaveToken(jwt) - Lưu token thủ công');
}
