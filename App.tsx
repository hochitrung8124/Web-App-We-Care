import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import LeadTable from './components/LeadTable';
import CustomerSidebar from './components/CustomerSidebar';
import { getProspectiveCustomerService, roleService } from './services';
import { Lead } from './types';

function App() {
  const [allLeads, setAllLeads] = useState<Lead[]>([]); // All loaded leads
  const [leads, setLeads] = useState<Lead[]>([]); // Current page leads
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [saving, setSaving] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [department, setDepartment] = useState<'SALE' | 'MARKETING' | 'ALL' | null>(null);
  const [filteredLeadsCount, setFilteredLeadsCount] = useState(0); // Track filtered leads count
  const [searchText, setSearchText] = useState('');
  const [sourceFilter, setSourceFilter] = useState('--Select--');
  const ITEMS_PER_PAGE = 5;
  const TOTAL_RECORDS_TO_LOAD = 50; // Load 50 records from Dataverse

  // Get service instance
  const customerService = getProspectiveCustomerService();

  // Load all leads from Dataverse once
  useEffect(() => {
    loadAllLeads();
    checkUserRoles();
  }, []);

  const checkUserRoles = async () => {
    try {
      const userRoleInfo = await roleService.checkUserRoles();
      
      if (userRoleInfo.isSale) {
        // Auto-login to Sale department
        setIsAdmin(false);
        setDepartment('SALE');
      } else if (userRoleInfo.isMarketing) {
        // Auto-login to Marketing department
        setIsAdmin(false);
        setDepartment('MARKETING');
      } else {
        // Admin or default user - show department selection
        setIsAdmin(userRoleInfo.isAdmin || true);
      }
    } catch (error) {
      console.error('❌ Error checking user roles:', error);
      // On error, default to allowing department selection
      setIsAdmin(true);
    }
  };

  // Update displayed leads when page changes
  useEffect(() => {
    updateDisplayedLeads();
  }, [currentPage, allLeads, department, searchText, sourceFilter]);

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
    let filteredLeads = allLeads;

    // Filter by department if selected
    if (department === 'MARKETING') {
      filteredLeads = filteredLeads.filter(lead => 
        lead.status === 'Đợi xác nhận' || lead.status === 'Chờ xác nhận'
      );
    } else if (department === 'SALE') {
      filteredLeads = filteredLeads.filter(lead => 
        lead.status === 'Marketing đã xác nhận'
      );
    } else if (department === 'ALL') {
      // Show all leads without department filtering
      filteredLeads = allLeads;
    }

    // Filter by search text (name or phone)
    if (searchText.trim()) {
      const search = searchText.toLowerCase().trim();
      filteredLeads = filteredLeads.filter(lead => 
        lead.name.toLowerCase().includes(search) ||
        lead.phone.toLowerCase().includes(search)
      );
    }

    // Filter by source
    if (sourceFilter && sourceFilter !== '--Select--') {
      filteredLeads = filteredLeads.filter(lead => 
        lead.source === sourceFilter
      );
    }

    // Update filtered count for pagination
    setFilteredLeadsCount(filteredLeads.length);
    
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const pageLeads = filteredLeads.slice(startIndex, endIndex);
    setLeads(pageLeads);
    
    // Start with no lead selected
    setSelectedLead(null);
  };

  const handleSelectLead = (lead: Lead) => {
    setSelectedLead(lead);
  };
 
  const handleDepartmentSelect = (dept: 'SALE' | 'MARKETING' | 'ALL') => {
    setDepartment(dept);
    setCurrentPage(1); // Reset to first page
  };

  // Render Role Selection Screen for Admin
  if (isAdmin && !department) {
    return (
      <div className="flex flex-col h-screen overflow-hidden bg-background-light dark:bg-background-dark items-center justify-center">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Chọn Vai Trò</h1>
          <p className="text-slate-600 dark:text-slate-400">Vui lòng chọn bộ phận làm việc</p>
        </div>
        
        <div className="flex gap-6">
          <button
            onClick={() => handleDepartmentSelect('SALE')}
            className="flex flex-col items-center justify-center w-48 h-48 bg-white dark:bg-slate-800 rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border border-transparent hover:border-primary group"
          >
            <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors text-blue-600 dark:text-blue-400">
              <span className="material-symbols-outlined text-3xl">point_of_sale</span>
            </div>
            <span className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-primary">Sale</span>
          </button>

          <button
            onClick={() => handleDepartmentSelect('MARKETING')}
            className="flex flex-col items-center justify-center w-48 h-48 bg-white dark:bg-slate-800 rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border border-transparent hover:border-amber-500 group"
          >
            <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center mb-4 group-hover:bg-amber-500 group-hover:text-white transition-colors text-amber-600 dark:text-amber-400">
              <span className="material-symbols-outlined text-3xl">campaign</span>
            </div>
            <span className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-amber-500">Marketing</span>
          </button>

          <button
            onClick={() => handleDepartmentSelect('ALL')}
            className="flex flex-col items-center justify-center w-48 h-48 bg-white dark:bg-slate-800 rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border border-transparent hover:border-green-500 group"
          >
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center mb-4 group-hover:bg-green-500 group-hover:text-white transition-colors text-green-600 dark:text-green-400">
              <span className="material-symbols-outlined text-3xl">dashboard</span>
            </div>
            <span className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-green-500">Xem Tất Cả</span>
          </button>
        </div>
      </div>
    );
  }

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

  if (isAdmin && !department) {
    return (
      <div className="flex flex-col h-screen overflow-hidden bg-background-light dark:bg-background-dark items-center justify-center">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Chọn Vai Trò</h1>
          <p className="text-slate-600 dark:text-slate-400">Vui lòng chọn bộ phận làm việc</p>
        </div>
        
        <div className="flex gap-6">
          <button
            onClick={() => handleDepartmentSelect('SALE')}
            className="flex flex-col items-center justify-center w-48 h-48 bg-white dark:bg-slate-800 rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border border-transparent hover:border-primary group"
          >
            <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors text-blue-600 dark:text-blue-400">
              <span className="material-symbols-outlined text-3xl">point_of_sale</span>
            </div>
            <span className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-primary">Sale</span>
          </button>

          <button
            onClick={() => handleDepartmentSelect('MARKETING')}
            className="flex flex-col items-center justify-center w-48 h-48 bg-white dark:bg-slate-800 rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border border-transparent hover:border-amber-500 group"
          >
            <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center mb-4 group-hover:bg-amber-500 group-hover:text-white transition-colors text-amber-600 dark:text-amber-400">
              <span className="material-symbols-outlined text-3xl">campaign</span>
            </div>
            <span className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-amber-500">Marketing</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Header searchText={searchText} onSearchChange={setSearchText} />
      
      {/* Main Container */}
      <div className="flex h-[calc(100vh-65px)] overflow-hidden relative">
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto px-4 md:px-10 py-4 custom-scrollbar bg-background-light dark:bg-background-dark" >
        {/* Breadcrumbs */}


        {/* Title and Top Actions */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
            <div>
              <h1 className="text-slate-900 dark:text-white text-2xl font-bold leading-tight tracking-tight">
                Xác nhận thông tin khách hàng {department ? `(${department === 'SALE' ? 'Sale' : department === 'MARKETING' ? 'Marketing' : 'Tất Cả'})` : ''}
              </h1>
            </div>
            <div className="flex gap-3 items-center">
              {/* Source Filter */}
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                style={{ paddingRight: '30px' }}
                className="h-10 px-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >             
                <option value="--Select--">Tất cả nguồn</option>
                <option value="Facebook Ads">Facebook Ads</option>
                <option value="TikTok Ads">TikTok Ads</option>
                <option value="Google Ads">Google Ads</option>
                <option value="Facebook Messenger Organic">FB Messenger</option>
                <option value="Zalo">Zalo</option>
                <option value="Website Form">Website Form</option>
                <option value="Other">Other</option>
              </select>

              {/* Clear Filter Icon */}
              {sourceFilter !== '--Select--' && (
                <button
                  onClick={() => setSourceFilter('--Select--')}
                  className="h-10 w-10 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors flex items-center justify-center"
                  title="Xóa bộ lọc"
                >
                  <span className="material-symbols-outlined text-[20px]">filter_alt_off</span>
                </button>
              )}

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
              
              {/* Pagination Controls - Below table, right aligned */}
              {leads.length > 0 && (
                <div className="flex justify-end mt-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePrevPage}
                      disabled={currentPage === 1 || loading}
                      className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Trang trước"
                    >
                      <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                    </button>
                    
                    <div className="flex items-center gap-1">
                      {(() => {
                        const totalPages = Math.ceil(filteredLeadsCount / ITEMS_PER_PAGE) || 1;
                        const pages = [];
                        
                        if (totalPages <= 7) {
                          for (let i = 1; i <= totalPages; i++) pages.push(i);
                        } else {
                          pages.push(1);
                          if (currentPage > 3) pages.push('...');
                          
                          const start = Math.max(2, currentPage - 1);
                          const end = Math.min(totalPages - 1, currentPage + 1);
                          for (let i = start; i <= end; i++) pages.push(i);
                          
                          if (currentPage < totalPages - 2) pages.push('...');
                          pages.push(totalPages);
                        }
                        
                        return pages.map((p, idx) => (
                          typeof p === 'number' ? (
                            <button 
                              key={idx}
                              onClick={() => setCurrentPage(p)}
                              className={`min-w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors
                                ${p === currentPage 
                                  ? 'bg-primary text-white font-bold' 
                                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-500'}`}
                            >
                              {p}
                            </button>
                          ) : (
                            <span key={idx} className="px-2 text-slate-400">...</span>
                          )
                        ));
                      })()}
                    </div>
                    
                    <button
                      onClick={handleNextPage}
                      disabled={currentPage >= Math.ceil(filteredLeadsCount / ITEMS_PER_PAGE) || loading}
                      className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Trang sau"
                    >
                      <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                    </button>
                  </div>
                </div>
              )}
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
    
  );
}

export default App;