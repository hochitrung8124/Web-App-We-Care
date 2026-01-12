import React, { useState } from 'react';
import Header from './components/Header';
import LeadTable from './components/LeadTable';
import CustomerSidebar from './components/CustomerSidebar';
import { LEADS_DATA } from './constants';
import { Lead } from './types';

function App() {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(LEADS_DATA[0]);

  const handleSelectLead = (lead: Lead) => {
    setSelectedLead(lead);
  };

  const handleCloseSidebar = () => {
    setSelectedLead(null);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Header />
      
      {/* Main Container */}
      <div className="flex h-[calc(100vh-65px)] overflow-hidden relative">
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto px-4 md:px-10 py-6 custom-scrollbar bg-background-light dark:bg-background-dark">
          {/* Breadcrumbs */}
          <div className="flex flex-wrap gap-2 py-2 mb-4">
            <a className="text-slate-500 text-sm font-medium leading-normal hover:text-primary" href="#">Hệ thống CRM</a>
            <span className="text-slate-400 text-sm font-medium leading-normal">/</span>
            <a className="text-slate-500 text-sm font-medium leading-normal hover:text-primary" href="#">Quản lý Leads</a>
            <span className="text-slate-400 text-sm font-medium leading-normal">/</span>
            <span className="text-slate-900 dark:text-white text-sm font-bold leading-normal">Khách hàng chờ xác nhận</span>
          </div>

          {/* Title and Top Actions */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
            <div>
              <h1 className="text-slate-900 dark:text-white text-2xl font-bold leading-tight tracking-tight">
                Xác nhận Leads từ MKT
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                Xử lý nhanh danh sách khách hàng mới.
              </p>
            </div>
            <div className="flex gap-3">
              <button className="flex h-10 items-center justify-center gap-x-2 rounded-lg bg-primary px-4 text-white text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors">
                <span className="material-symbols-outlined text-[20px]">refresh</span>
                Lấy Leads mới
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center justify-end mb-4">
            <button className="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-50 transition-colors">
              <span className="material-symbols-outlined text-[18px]">filter_list</span>
              <span>Bộ lọc</span>
            </button>
          </div>

          {/* Table */}
          <LeadTable 
            leads={LEADS_DATA} 
            selectedLeadId={selectedLead?.id || null} 
            onSelectLead={handleSelectLead} 
          />
        </main>

        {/* Right Sidebar */}
        {selectedLead && (
          <CustomerSidebar lead={selectedLead} onClose={handleCloseSidebar} />
        )}
      </div>
    </div>
  );
}

export default App;