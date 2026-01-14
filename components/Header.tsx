import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from './AuthGuard';
import { useDarkMode } from './DarkModeProvider';
import { useNotifications } from './NotificationContext';
import ConfirmModal from './ConfirmModal';
import { createExcelTemplate } from '../services/ExcelImportService';

interface HeaderProps {
  searchText: string;
  onSearchChange: (value: string) => void;
}

const Header: React.FC<HeaderProps> = ({ searchText, onSearchChange }) => {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useDarkMode();
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } = useNotifications();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    logout();
  };

  const handleDownloadTemplate = async () => {
    try {
      await createExcelTemplate();
      setShowSettingsMenu(false);
      toast.success('Tải xuống file mẫu thành công!', {
        duration: 3000,
        icon: '📄',
      });
    } catch (error) {
      console.error('Error creating template:', error);
      toast.error('Lỗi tạo file mẫu', {
        duration: 3000,
        icon: '❌',
      });
    }
  };

  const formatNotificationTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Vừa xong';
    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    return `${days} ngày trước`;
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'add':
        return 'person_add';
      case 'update':
        return 'edit';
      case 'import':
        return 'upload_file';
      default:
        return 'notifications';
    }
  };

  const getNotificationColor = (department: string) => {
    switch (department) {
      case 'MARKETING':
        return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20';
      case 'SALE':
        return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20';
      default:
        return 'text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/20';
    }
  };

  return (
    <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-10 py-3 sticky top-0 z-50">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-3 text-primary">
          <div className="size-8 rounded-lg flex items-center justify-center overflow-hidden">
            <img src="https://i.imgur.com/tD07Yrv.png" alt="WeCare Logo" className="w-full h-full object-contain" />
          </div>
          <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">
            WeCare
          </h2>
        </div>
        <label className="flex flex-col min-w-40 h-10 max-w-64">
          <div className="flex w-full flex-1 items-stretch rounded-lg h-full overflow-hidden">
            <div className="text-slate-500 flex border-none bg-slate-100 dark:bg-slate-800 items-center justify-center pl-4">
              <span className="material-symbols-outlined text-[20px]">search</span>
            </div>
            <input
              className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-r-lg text-slate-900 dark:text-white focus:outline-0 focus:ring-0 border-none bg-slate-100 dark:bg-slate-800 placeholder:text-slate-500 px-4 pl-2 text-sm font-normal"
              placeholder="Tìm kiếm SĐT, tên..."
              value={searchText}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        </label>
      </div>
      <div className="flex flex-1 justify-end gap-6 items-center">
        {/* <nav className="flex items-center gap-6 hidden md:flex">
          <a
            className="text-primary text-sm font-semibold leading-normal border-b-2 border-primary py-4 -mb-4"
            href="#"
          >
            MKT Leads
          </a>
        </nav> */}
        <div className="flex gap-2">
          {/* Notifications */}
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative flex items-center justify-center rounded-lg h-10 w-10 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <span className="material-symbols-outlined">notifications</span>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowNotifications(false)}
                ></div>
                <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-slate-900 rounded-lg shadow-xl border border-slate-200 dark:border-slate-800 z-50 max-h-[500px] flex flex-col">
                  {/* Header */}
                  <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">Thông báo</p>
                      {unreadCount > 0 && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{unreadCount} chưa đọc</p>
                      )}
                    </div>
                    {notifications.length > 0 && (
                      <div className="flex gap-2">
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllAsRead}
                            className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            Đánh dấu tất cả
                          </button>
                        )}
                        <button
                          onClick={clearAll}
                          className="text-xs text-red-600 dark:text-red-400 hover:underline"
                        >
                          Xóa tất cả
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Notifications List */}
                  <div className="overflow-y-auto flex-1">
                    {notifications.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 px-4">
                        <span className="material-symbols-outlined text-slate-300 dark:text-slate-700 text-5xl mb-3">notifications_off</span>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Chưa có thông báo</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {notifications.map((notification) => (
                          <div
                            key={notification.id}
                            onClick={() => markAsRead(notification.id)}
                            className={`px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer ${
                              !notification.read ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                getNotificationColor(notification.department)
                              }`}>
                                <span className="material-symbols-outlined text-lg">
                                  {getNotificationIcon(notification.type)}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm ${
                                  !notification.read 
                                    ? 'font-bold text-slate-900 dark:text-white' 
                                    : 'font-medium text-slate-700 dark:text-slate-300'
                                }`}>
                                  {notification.message}
                                </p>
                                {notification.customerName && (
                                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                    {notification.customerName}
                                  </p>
                                )}
                                <div className="flex items-center gap-2 mt-1.5">
                                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                                    notification.department === 'MARKETING' 
                                      ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                                      : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                                  }`}>
                                    {notification.department}
                                  </span>
                                  <span className="text-xs text-slate-400 dark:text-slate-500">
                                    {formatNotificationTime(notification.timestamp)}
                                  </span>
                                </div>
                              </div>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
          
          {/* Settings Menu */}
          <div className="relative">
            <button
              onClick={() => setShowSettingsMenu(!showSettingsMenu)}
              className="flex items-center justify-center rounded-lg h-10 w-10 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <span className="material-symbols-outlined">settings</span>
            </button>

            {/* Settings Dropdown Menu */}
            {showSettingsMenu && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowSettingsMenu(false)}
                ></div>
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-lg shadow-xl border border-slate-200 dark:border-slate-800 py-2 z-50">
                  <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-800">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Giao diện
                    </p>
                  </div>
                  
                  {/* Theme Options */}
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setTheme('light');
                        setShowSettingsMenu(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${
                        theme === 'light' ? 'bg-slate-50 dark:bg-slate-800' : ''
                      }`}
                    >
                      <span className="material-symbols-outlined text-xl text-slate-700 dark:text-slate-300">
                        light_mode
                      </span>
                      <div className="flex-1">
                        <span className="text-sm font-medium text-slate-900 dark:text-white">Sáng</span>
                      </div>
                      {theme === 'light' && (
                        <span className="material-symbols-outlined text-lg text-primary">check</span>
                      )}
                    </button>

                    <button
                      onClick={() => {
                        setTheme('dark');
                        setShowSettingsMenu(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${
                        theme === 'dark' ? 'bg-slate-50 dark:bg-slate-800' : ''
                      }`}
                    >
                      <span className="material-symbols-outlined text-xl text-slate-700 dark:text-slate-300">
                        dark_mode
                      </span>
                      <div className="flex-1">
                        <span className="text-sm font-medium text-slate-900 dark:text-white">Tối</span>
                      </div>
                      {theme === 'dark' && (
                        <span className="material-symbols-outlined text-lg text-primary">check</span>
                      )}
                    </button>

                    <button
                      onClick={() => {
                        setTheme('auto');
                        setShowSettingsMenu(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${
                        theme === 'auto' ? 'bg-slate-50 dark:bg-slate-800' : ''
                      }`}
                    >
                      <span className="material-symbols-outlined text-xl text-slate-700 dark:text-slate-300">
                        brightness_auto
                      </span>
                      <div className="flex-1">
                        <span className="text-sm font-medium text-slate-900 dark:text-white">Tự động</span>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Theo trình duyệt</p>
                      </div>
                      {theme === 'auto' && (
                        <span className="material-symbols-outlined text-lg text-primary">check</span>
                      )}
                    </button>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-slate-200 dark:border-slate-800 my-2"></div>

                  {/* Tools Section */}
                  <div className="px-4 py-2">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                      Công cụ
                    </p>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={handleDownloadTemplate}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <span className="material-symbols-outlined text-xl text-emerald-600 dark:text-emerald-400">
                        download
                      </span>
                      <div className="flex-1">
                        <span className="text-sm font-medium text-slate-900 dark:text-white">Tải mẫu Excel</span>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Import khách hàng</p>
                      </div>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
        
        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            title={user?.email || user?.username}
          >
            <div
              className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 ring-2 ring-primary/20"
              style={{
                backgroundImage: 'url("https://picsum.photos/100/100")',
              }}
            ></div>
            <div className="hidden lg:block text-left">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                {user?.name || user?.username || 'User'}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {user?.email || 'user@example.com'}
              </p>
            </div>
          </button>

          {/* Dropdown Menu */}
          {showUserMenu && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowUserMenu(false)}
              ></div>
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-lg shadow-xl border border-slate-200 dark:border-slate-800 py-2 z-50">
                <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {user?.name || user?.username}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {user?.email}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-red-600 dark:text-red-400"
                >
                  <span className="material-symbols-outlined text-xl">logout</span>
                  <span className="text-sm font-medium">Đăng xuất</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Logout Confirm Modal */}
      <ConfirmModal
        isOpen={showLogoutConfirm}
        title="Xác nhận đăng xuất"
        message="Bạn có chắc chắn muốn đăng xuất?"
        confirmText="Đăng xuất"
        cancelText="Hủy"
        type="danger"
        onConfirm={confirmLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </header>
  );
};

export default Header;