import React, { useState } from 'react';
import { loginWithPopup, saveTokenManually, type UserInfo } from '../implicitAuthService';

interface LoginProps {
  onLoginSuccess: (user: UserInfo) => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualToken, setManualToken] = useState('');

  const handleMicrosoftLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await loginWithPopup();
      onLoginSuccess(result.user);
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Đăng nhập thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleManualTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const result = saveTokenManually(manualToken.trim());
      onLoginSuccess(result.user);
    } catch (err) {
      console.error('Manual token error:', err);
      setError(err instanceof Error ? err.message : 'Token không hợp lệ');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 px-4">
      <div className="w-full max-w-md">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-blue-600 rounded-2xl mb-4 shadow-lg shadow-primary/30">
            <span className="material-symbols-outlined text-white text-3xl">dashboard_customize</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Chào mừng trở lại
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Đăng nhập để tiếp tục sử dụng CRM Sale Dashboard
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-8">
          
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
              <span className="material-symbols-outlined text-red-600 dark:text-red-400 text-xl mt-0.5">error</span>
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800 dark:text-red-300">Lỗi đăng nhập</p>
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">{error}</p>
              </div>
            </div>
          )}

          {!showManualInput ? (
            <>
              {/* Microsoft Login Button */}
              <button
                onClick={handleMicrosoftLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 h-12 rounded-lg bg-gradient-to-r from-primary to-blue-600 text-white font-semibold shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Đang đăng nhập...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="1" y="1" width="9" height="9" fill="currentColor"/>
                      <rect x="1" y="11" width="9" height="9" fill="currentColor"/>
                      <rect x="11" y="1" width="9" height="9" fill="currentColor"/>
                      <rect x="11" y="11" width="9" height="9" fill="currentColor"/>
                    </svg>
                    <span>Đăng nhập với Microsoft</span>
                  </>
                )}
              </button>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400">
                    hoặc
                  </span>
                </div>
              </div>

              {/* Manual Token Button */}
              <button
                onClick={() => setShowManualInput(true)}
                className="w-full flex items-center justify-center gap-2 h-11 rounded-lg border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <span className="material-symbols-outlined text-xl">vpn_key</span>
                <span>Sử dụng Token thủ công</span>
              </button>
            </>
          ) : (
            <>
              {/* Manual Token Input */}
              <form onSubmit={handleManualTokenSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Access Token
                  </label>
                  <textarea
                    value={manualToken}
                    onChange={(e) => setManualToken(e.target.value)}
                    placeholder="Dán JWT token vào đây..."
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none font-mono text-sm"
                    rows={6}
                    required
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                    💡 Token phải là JWT hợp lệ từ Microsoft Azure AD
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowManualInput(false);
                      setManualToken('');
                      setError(null);
                    }}
                    className="flex-1 h-11 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    Quay lại
                  </button>
                  <button
                    type="submit"
                    className="flex-1 h-11 rounded-lg bg-primary text-white font-semibold hover:bg-primary/90 transition-colors"
                  >
                    Xác nhận
                  </button>
                </div>
              </form>
            </>
          )}

          {/* Features List */}
          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-wide">
              Tính năng nổi bật
            </p>
            <div className="space-y-2">
              {[
                'Quản lý Leads từ Marketing',
                'Xác nhận khách hàng tự động',
                'Theo dõi trạng thái real-time',
                'Báo cáo và phân tích'
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <span className="material-symbols-outlined text-primary text-base">check_circle</span>
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Bảo mật với <span className="font-semibold text-primary">Microsoft Azure AD</span>
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
            © 2026 WeCare CRM. Bảo vệ bởi OAuth 2.0
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
