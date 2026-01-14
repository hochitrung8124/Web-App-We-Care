import React, { useState } from 'react';
import { useAuth } from './AuthGuard';
import { useDarkMode } from './DarkModeProvider';

interface HeaderProps {
  searchText: string;
  onSearchChange: (value: string) => void;
}

const Header: React.FC<HeaderProps> = ({ searchText, onSearchChange }) => {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useDarkMode();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);

  const handleLogout = () => {
    if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
      logout();
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
          <button className="flex items-center justify-center rounded-lg h-10 w-10 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          
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
    </header>
  );
};

export default Header;