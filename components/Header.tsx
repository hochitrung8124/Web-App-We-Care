import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-10 py-3 sticky top-0 z-50">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-3 text-primary">
          <div className="size-8 bg-primary/10 rounded-lg flex items-center justify-center">
            <span className="material-symbols-outlined text-primary">dashboard_customize</span>
          </div>
          <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">
            CRM Sale
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
            />
          </div>
        </label>
      </div>
      <div className="flex flex-1 justify-end gap-6 items-center">
        <nav className="flex items-center gap-6 hidden md:flex">
          <a
            className="text-primary text-sm font-semibold leading-normal border-b-2 border-primary py-4 -mb-4"
            href="#"
          >
            MKT Leads
          </a>
        </nav>
        <div className="flex gap-2">
          <button className="flex items-center justify-center rounded-lg h-10 w-10 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button className="flex items-center justify-center rounded-lg h-10 w-10 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
            <span className="material-symbols-outlined">settings</span>
          </button>
        </div>
        <div
          className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 ring-2 ring-primary/20 cursor-pointer"
          style={{
            backgroundImage:
              'url("https://picsum.photos/100/100")',
          }}
        ></div>
      </div>
    </header>
  );
};

export default Header;