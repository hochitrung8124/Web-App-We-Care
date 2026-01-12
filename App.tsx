import React, { useState, useEffect } from 'react';
import AuthGuard from './components/AuthGuard';
import Header from './components/Header';
import LeadTable from './components/LeadTable';
import CustomerSidebar from './components/CustomerSidebar';
import { getProspectiveCustomerService } from './services';
import { Lead } from './types';

function App() {
  const [allLeads, setAllLeads] = useState<Lead[]>([]); // All loaded leads
  const [leads, setLeads] = useState<Lead[]>([]); // Current page leads
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [saving, setSaving] = useState(false);
  const ITEMS_PER_PAGE = 5;
  const TOTAL_RECORDS_TO_LOAD = 50; // Load 50 records from Dataverse

  // Get service instance
  const customerService = getProspectiveCustomerService();

  // Load all leads from Dataverse once
  useEffect(() => {
    loadAllLeads();
  }, []);

  // Update displayed leads when page changes
  useEffect(() => {
    updateDisplayedLeads();
  }, [currentPage, allLeads]);

  const loadAllLeads = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('📊 Loading leads from Dataverse...');
      
      const data = await customerService.getProspectiveCustomers(TOTAL_RECORDS_TO_LOAD);
      setAllLeads(data);
      
      console.log('✅ Loaded', data.length, 'leads total');
    } catch (err) {
      console.error('❌ Error loading leads:', err);
      setError(err instanceof Error ? err.message : 'Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const updateDisplayedLeads = () => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const pageLeads = allLeads.slice(startIndex, endIndex);
    setLeads(pageLeads);
    
    // Auto-select first lead on page (always when changing page)
    if (pageLeads.length > 0) {
      setSelectedLead(pageLeads[0]);
    }
  };

  const handleSelectLead = (lead: Lead) => {
    setSelectedLead(lead);
  };

  const handleCloseSidebar = () => {
    setSelectedLead(null);
  };

  const handleRefresh = () => {
    setCurrentPage(1);
    loadAllLeads();
  };

  const handleNextPage = () => {
    setCurrentPage(prev => prev + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleSaveLead = async (updatedLead: Lead) => {
    try {
      setSaving(true);
      console.log('💾 Saving lead:', updatedLead.id);
      
      // Update in Dataverse
      await customerService.updateProspectiveCustomer(updatedLead.id, updatedLead);
      
      // Update in allLeads
      setAllLeads(prevLeads => 
        prevLeads.map(lead => lead.id === updatedLead.id ? updatedLead : lead)
      );
      
      // Update current page leads
      setLeads(prevLeads => 
        prevLeads.map(lead => lead.id === updatedLead.id ? updatedLead : lead)
      );
      
      setSelectedLead(updatedLead);
      
      console.log('✅ Lead saved successfully');
    } catch (err) {
      console.error('❌ Error saving lead:', err);
      setError(err instanceof Error ? err.message : 'Không thể lưu dữ liệu');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AuthGuard>
      <div className="flex flex-col h-screen overflow-hidden">
        <Header />
        
        {/* Main Container */}
        <div className="flex h-[calc(100vh-65px)] overflow-hidden relative">
          
          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto px-4 md:px-10 py-6 custom-scrollbar bg-background-light dark:bg-background-dark">
          {/* Breadcrumbs */}


          {/* Title and Top Actions */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
            <div>
              <h1 className="text-slate-900 dark:text-white text-2xl font-bold leading-tight tracking-tight">
                Xác nhận thông tin khách hàng
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                {loading ? 'Đang tải dữ liệu...' : `Hiển thị ${leads.length} / ${allLeads.length} khách hàng (Trang ${currentPage}/${Math.ceil(allLeads.length / ITEMS_PER_PAGE)})`}
              </p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={handleRefresh}
                disabled={loading}
                className="flex h-10 items-center justify-center gap-x-2 rounded-lg bg-primary px-4 text-white text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-[20px]">{loading ? 'sync' : 'refresh'}</span>
                {loading ? 'Đang tải...' : 'Lấy Leads mới'}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
              <span className="material-symbols-outlined text-red-600 dark:text-red-400 text-xl">error</span>
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800 dark:text-red-300">Lỗi tải dữ liệu</p>
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">{error}</p>
                <button 
                  onClick={handleRefresh}
                  className="mt-2 text-sm text-red-700 dark:text-red-300 underline hover:no-underline"
                >
                  Thử lại
                </button>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="inline-block w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-slate-600 dark:text-slate-400">Đang tải dữ liệu từ Dataverse...</p>
              </div>
            </div>
          )}
         
          {/* Table */}
          {!loading && !error && (
            <>
              <LeadTable 
                leads={leads} 
                selectedLeadId={selectedLead?.id || null} 
                onSelectLead={handleSelectLead} 
              />
              
              {/* Pagination Controls */}
              <div className="flex items-center justify-between mt-6 px-4 py-3 bg-white dark:bg-slate-600 rounded-lg border border-slate-100 dark:border-slate-400">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1 || loading}
                  className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Trang trước"
                >
                  <span className="material-symbols-outlined text-[24px]">chevron_left</span>
                </button>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Trang</span>
                  <span className="px-3 py-1 rounded-lg bg-primary text-white font-bold text-sm">
                    {currentPage} / {Math.ceil(allLeads.length / ITEMS_PER_PAGE) || 1}
                  </span>
                </div>
                
                <button
                  onClick={handleNextPage}
                  disabled={currentPage >= Math.ceil(allLeads.length / ITEMS_PER_PAGE) || loading}
                  className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Trang sau"
                >
                  <span className="material-symbols-outlined text-[24px]">chevron_right</span>
                </button>
              </div>
            </>
          )}

          {/* Empty State */}
          {!loading && !error && leads.length === 0 && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <span className="material-symbols-outlined text-slate-400 text-6xl mb-4">inbox</span>
                <p className="text-slate-600 dark:text-slate-400 text-lg font-medium">Không có leads nào</p>
                <p className="text-slate-500 dark:text-slate-500 text-sm mt-2">Nhấn "Lấy Leads mới" để tải dữ liệu</p>
              </div>
            </div>
          )}
        </main>

          {/* Right Sidebar */}
          {selectedLead && (
            <CustomerSidebar 
              lead={selectedLead} 
              onClose={handleCloseSidebar}
              onSave={handleSaveLead}
              saving={saving}
            />
          )}
        </div>
      </div>
    </AuthGuard>
  );
}

export default App;