import React, { useState, useEffect } from 'react';
import { Lead } from '../types';

interface CustomerSidebarProps {
  lead: Lead | null;
  onClose: () => void;
}

const CustomerSidebar: React.FC<CustomerSidebarProps> = ({ lead, onClose }) => {
  if (!lead) return null;

  return (
    <aside className="w-full md:w-[450px] bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col h-full shadow-2xl z-40 absolute right-0 top-0 bottom-0 md:relative">
      {/* Sidebar Header */}
      <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className={`size-10 rounded-full flex items-center justify-center font-bold text-lg ${lead.avatarColorClass.replace('bg-', 'bg-opacity-10 ')}`}
            >
              {lead.initials}
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                {lead.name}
              </h3>
              <p className="text-slate-500 text-xs">
                ID: #{lead.id.padStart(5, '4')} • MKT Verify
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-slate-400 transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="flex gap-2">
          <button className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all">
            <span className="material-symbols-outlined text-[18px]">call</span>
            Gọi ngay
          </button>
          <button className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-1.5 hover:bg-slate-50 transition-all">
            <span className="material-symbols-outlined text-[18px]">chat_bubble</span>
            Zalo
          </button>
        </div>
      </div>

      {/* Sidebar Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
        
        {/* Section: Thông tin định danh & Hành chính */}
        <section className="space-y-4">
          <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-2">
            Thông tin định danh & Hành chính
          </h4>
          
          {/* Ngày sinh */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              Ngày sinh
            </label>
            <input
              className="form-input w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm py-2 px-3 focus:ring-primary focus:border-primary outline-none border"
              type="date"
              defaultValue={lead.birthDate}
              key={`dob-${lead.id}`}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
             {/* Quận huyện - Từ DB */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Quận huyện
              </label>
              <input
                className="form-input w-full rounded-lg border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 text-sm py-2 px-3 outline-none border cursor-not-allowed"
                type="text"
                readOnly
                defaultValue={lead.district}
                key={`district-${lead.id}`}
              />
            </div>
             {/* Tỉnh thành - Từ DB */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Tỉnh thành
              </label>
              <input
                className="form-input w-full rounded-lg border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 text-sm py-2 px-3 outline-none border cursor-not-allowed"
                type="text"
                readOnly
                defaultValue={lead.city}
                key={`city-${lead.id}`}
              />
            </div>
          </div>
          
          {/* Tên thương mại - Từ DB */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              Tên thương mại
            </label>
            <input
              className="form-input w-full rounded-lg border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 text-sm py-2 px-3 outline-none border cursor-not-allowed font-medium"
              type="text"
              readOnly
              defaultValue={lead.tradeName}
              key={`tradeName-${lead.id}`}
            />
          </div>
        </section>

        {/* Section: Ngành nghề & Điều khoản */}
        <section className="space-y-4">
          <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-2">
            Ngành nghề & Điều khoản
          </h4>

          {/* Ngành nghề chi tiết */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              Ngành nghề chi tiết
            </label>
            <input
              className="form-input w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm py-2 px-3 focus:ring-primary focus:border-primary outline-none border"
              type="text"
              defaultValue={lead.detailedIndustry}
              key={`detailedIndustry-${lead.id}`}
            />
          </div>
           {/* Ngành chủ lực & Ngành phụ */}
          <div className="grid grid-cols-2 gap-4">
             <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Ngành chủ lực
              </label>
              <input
                className="form-input w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm py-2 px-3 focus:ring-primary focus:border-primary outline-none border"
                type="text"
                defaultValue={lead.keyIndustry}
                key={`keyIndustry-${lead.id}`}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Ngành phụ
              </label>
              <input
                className="form-input w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm py-2 px-3 focus:ring-primary focus:border-primary outline-none border"
                type="text"
                defaultValue={lead.subIndustry}
                key={`subIndustry-${lead.id}`}
              />
            </div>
          </div>

          {/* Điều khoản thanh toán */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              Điều khoản thanh toán
            </label>
            <input
              className="form-input w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm py-2 px-3 focus:ring-primary focus:border-primary outline-none border"
              type="text"
              defaultValue={lead.paymentTerms}
              key={`paymentTerms-${lead.id}`}
              placeholder="VD: Net 30, COD..."
            />
          </div>
        </section>

        {/* Section: Nhân sự phụ trách */}
        <section className="space-y-4">
          <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-2">
            Nhân sự phụ trách
          </h4>
          
          {/* Supervisor - Từ DB */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              Supervisor
            </label>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium">
                <span className="material-symbols-outlined text-[18px] text-slate-500">supervisor_account</span>
                {lead.supervisor}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Nhân viên sale - Lookup */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Nhân viên Sale
              </label>
              <div className="relative">
                <input
                  className="form-input w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm py-2 pl-3 pr-8 focus:ring-primary focus:border-primary outline-none border"
                  type="text"
                  defaultValue={lead.salesStaff}
                  key={`salesStaff-${lead.id}`}
                  placeholder="Chọn sales..."
                />
                <span className="material-symbols-outlined absolute right-2 top-2 text-slate-400 text-[18px]">search</span>
              </div>
            </div>

            {/* Nhân viên công nợ - Lookup */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Nhân viên Công nợ
              </label>
              <div className="relative">
                <input
                  className="form-input w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm py-2 pl-3 pr-8 focus:ring-primary focus:border-primary outline-none border"
                  type="text"
                  defaultValue={lead.debtStaff}
                  key={`debtStaff-${lead.id}`}
                  placeholder="Chọn NV..."
                />
                <span className="material-symbols-outlined absolute right-2 top-2 text-slate-400 text-[18px]">search</span>
              </div>
            </div>
          </div>
        </section>

        {/* Section: Thông tin & Đánh giá ban đầu */}
        <section className="space-y-4">
          <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-2">
            Đánh giá ban đầu
          </h4>

          {/* Tiềm năng ban đầu */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              Tiềm năng ban đầu
            </label>
            <input
              className="form-input w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm py-2 px-3 focus:ring-primary focus:border-primary outline-none border font-medium text-amber-600"
              type="text"
              defaultValue={lead.initialPotential}
              key={`initialPotential-${lead.id}`}
            />
          </div>

          {/* Thông tin chung ban đầu */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              Thông tin chung ban đầu
            </label>
            <textarea
              className="form-input w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm py-2 px-3 focus:ring-primary focus:border-primary h-16 outline-none border resize-none"
              defaultValue={lead.initialGeneralInfo}
              key={`initialGeneralInfo-${lead.id}`}
            ></textarea>
          </div>

          {/* Mô tả người đại diện */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              Mô tả người đại diện
            </label>
            <textarea
              className="form-input w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm py-2 px-3 focus:ring-primary focus:border-primary h-16 outline-none border resize-none"
              defaultValue={lead.repDescription}
              key={`repDescription-${lead.id}`}
            ></textarea>
          </div>
        </section>

      </div>

      {/* Sidebar Footer */}
      <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col gap-3">
        <button className="w-full h-12 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/30 hover:bg-primary/90 transition-all flex items-center justify-center gap-2">
          <span className="material-symbols-outlined text-[20px]">verified</span>
          Save &amp; Verify Sale
        </button>
        <button onClick={onClose} className="w-full py-2 text-slate-400 hover:text-slate-600 text-sm font-medium transition-colors">
          Để sau
        </button>
      </div>
    </aside>
  );
};

export default CustomerSidebar;