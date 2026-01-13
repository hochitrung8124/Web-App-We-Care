import React, { useState, useEffect } from 'react';
import { Lead } from '../types';
import {
  fetchQuanHuyen,
  fetchTinhThanh,
  fetchNhanVienCongNo,
  fetchNhanVienSale,
  fetchChoices,
  QuanHuyen,
  TinhThanh,
  Employee,
  ChoiceOption
} from '../services/ReferenceDataService';

interface CustomerSidebarProps {
  lead: Lead | null;
  onClose: () => void;
  onSave: (updatedLead: Lead) => void;
  saving?: boolean;
  isAdmin?: boolean;
}

// Default value - không cho chỉnh sửa
const DEFAULT_TEN_THUONG_MAI = 'WeShop';

const CustomerSidebar: React.FC<CustomerSidebarProps> = ({ lead, onClose, onSave, saving = false, isAdmin = false }) => {
  const [formData, setFormData] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);

  // Reference data states
  const [quanHuyenList, setQuanHuyenList] = useState<QuanHuyen[]>([]);
  const [tinhThanhList, setTinhThanhList] = useState<TinhThanh[]>([]);
  const [nhanVienCongNoList, setNhanVienCongNoList] = useState<Employee[]>([]);
  const [nhanVienSaleList, setNhanVienSaleList] = useState<Employee[]>([]);
  const [loaiCuaHangOptions, setLoaiCuaHangOptions] = useState<ChoiceOption[]>([]);
  const [nganhNgheOptions, setNganhNgheOptions] = useState<ChoiceOption[]>([]);
  const [dieuKhoanThanhToanOptions, setDieuKhoanThanhToanOptions] = useState<ChoiceOption[]>([]);
  const [tiemNangOptions, setTiemNangOptions] = useState<ChoiceOption[]>([]);
  const [nganhHangOptions, setNganhHangOptions] = useState<ChoiceOption[]>([]);

  // Load reference data
  useEffect(() => {
    loadReferenceData();
  }, []);

  const loadReferenceData = async () => {
    try {
      setLoading(true);
      console.log('📊 Loading reference data...');

      const [
        quanHuyen,
        tinhThanh,
        nvCongNo,
        nvSale,
        loaiCuaHang,
        nganhNghe,
        dieuKhoan,
        tiemNang,
        nganhHang
      ] = await Promise.all([
        fetchQuanHuyen(),
        fetchTinhThanh(),
        fetchNhanVienCongNo(),
        fetchNhanVienSale(),
        fetchChoices('crdfd_customer', 'cr1bb_loaicuahang'),
        fetchChoices('crdfd_customer', 'crdfd_nganhnghe'),
        fetchChoices('crdfd_customer', 'cr1bb_ieukhoanthanhtoan'),
        fetchChoices('crdfd_customer', 'cr1bb_tiemnangbanau'),
        fetchChoices('crdfd_customer', 'cr1bb_nganhchuluc')
      ]);

      setQuanHuyenList(quanHuyen);
      setTinhThanhList(tinhThanh);
      setNhanVienCongNoList(nvCongNo);
      setNhanVienSaleList(nvSale);
      setLoaiCuaHangOptions(loaiCuaHang);
      setNganhNgheOptions(nganhNghe);
      setDieuKhoanThanhToanOptions(dieuKhoan);
      setTiemNangOptions(tiemNang);
      setNganhHangOptions(nganhHang);

      console.log('✅ Reference data loaded');
    } catch (error) {
      console.error('❌ Error loading reference data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Initialize form data when lead changes
  useEffect(() => {
    if (lead) {
      // Find Supervisor by Tỉnh/Thành
      const supervisor = lead.supervisor || getSupervisorByCity(lead.city);

      setFormData({
        ...lead,
        tradeName: DEFAULT_TEN_THUONG_MAI, // Always WeShop
        supervisor: supervisor
      });
    }
  }, [lead, tinhThanhList]);

  // Get Supervisor by city from tinhThanhList
  const getSupervisorByCity = (cityName: string): string => {
    if (!cityName || !tinhThanhList.length) return '';
    const tt = tinhThanhList.find(t => t.tenTinhThanh === cityName);
    return tt?.supervisorName || '';
  };

  // Get Tỉnh/Thành by Quận/Huyện
  const getTinhThanhByQuanHuyen = (quanHuyenName: string): string => {
    if (!quanHuyenName || !quanHuyenList.length) return '';
    const qh = quanHuyenList.find(q => q.tenQuanHuyen === quanHuyenName);
    return qh?.tinhThanhName || '';
  };

  if (!lead || !formData) return null;

  const handleInputChange = (field: keyof Lead, value: any) => {
    setFormData(prev => prev ? { ...prev, [field]: value } : null);
  };

  // Handle Quận/Huyện change - auto-fill Tỉnh/Thành and Supervisor
  const handleQuanHuyenChange = (quanHuyenName: string) => {
    handleInputChange('district', quanHuyenName);

    // Auto-fill Tỉnh/Thành
    const tinhThanh = getTinhThanhByQuanHuyen(quanHuyenName);
    handleInputChange('city', tinhThanh);

    // Auto-fill Supervisor
    const supervisor = getSupervisorByCity(tinhThanh);
    handleInputChange('supervisor', supervisor);
  };

  const handleSave = () => {
    if (formData) {
      onSave(formData);
    }
  };

  // Render select with dynamic options
  const renderSelect = (
    label: string,
    value: string,
    options: { value: string | number, label: string }[],
    onChange: (val: string) => void,
    required: boolean = false,
    disabled: boolean = false,
    placeholder: string = '-- Chọn --'
  ) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      <select
        className={`form-select w-full rounded-lg text-sm py-2.5 px-3 outline-none border transition-all
          ${disabled
            ? 'border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/60 text-slate-500 cursor-not-allowed'
            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary'
          }`}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      >
        <option value="">{placeholder}</option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );

  // Render text input
  const renderInput = (
    label: string,
    field: keyof Lead,
    type: string = 'text',
    required: boolean = false,
    readOnly: boolean = false,
    placeholder: string = ''
  ) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      <input
        className={`form-input w-full rounded-lg text-sm py-2.5 px-3 outline-none border transition-all
          ${readOnly
            ? 'border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/60 text-slate-500 cursor-not-allowed'
            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary'
          }`}
        type={type}
        value={(formData[field] as string) || ''}
        onChange={(e) => handleInputChange(field, e.target.value)}
        readOnly={readOnly}
        placeholder={placeholder}
      />
    </div>
  );

  // Render textarea
  const renderTextarea = (
    label: string,
    field: keyof Lead,
    required: boolean = false,
    rows: number = 3
  ) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      <textarea
        className="form-textarea w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm py-2.5 px-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none border resize-none transition-all"
        value={(formData[field] as string) || ''}
        onChange={(e) => handleInputChange(field, e.target.value)}
        rows={rows}
      />
    </div>
  );

  // Show loading state
  if (loading) {
    return (
      <aside className="w-full md:w-[480px] bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col h-full shadow-2xl z-40 absolute right-0 top-0 bottom-0 md:relative items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-sm text-slate-500">Đang tải dữ liệu...</p>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-full md:w-[480px] bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col h-full shadow-2xl z-40 absolute right-0 top-0 bottom-0 md:relative">
      {/* Sidebar Header */}
      <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`size-12 rounded-xl flex items-center justify-center font-bold text-lg shadow-lg ${lead.avatarColorClass}`}>
              {lead.initials}
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                {formData.name || 'Khách hàng mới'}
              </h3>
              <p className="text-slate-500 text-xs flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">tag</span>
                ID: {lead.id.padStart(5, '0')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-slate-600 transition-all"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2">
          <button className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold py-2.5 rounded-lg flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all">
            <span className="material-symbols-outlined text-[18px]">call</span>
            Gọi ngay
          </button>
          <button className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold py-2.5 rounded-lg flex items-center justify-center gap-1.5 shadow-lg shadow-blue-500/20 transition-all">
            <span className="material-symbols-outlined text-[18px]">chat</span>
            Zalo
          </button>
        </div>
      </div>

      {/* Sidebar Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">

        {/* Section 1: Thông tin cơ bản */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <span className="material-symbols-outlined text-primary text-[18px]">person</span>
            <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
              Thông tin cơ bản
            </h4>
          </div>

          {renderInput('Tên khách hàng', 'name', 'text', true)}
          {renderInput('Điện thoại', 'phone', 'tel', true)}
          {renderInput('Mã số thuế (MST)', 'taxCode', 'text')}
          {renderTextarea('Địa chỉ', 'address', true, 2)}
          {renderInput('Ngày sinh', 'birthDate', 'date')}

          {/* Loại cửa hàng - từ API */}
          {renderSelect(
            'Loại cửa hàng',
            formData.loaiCuaHang || '',
            loaiCuaHangOptions.map(o => ({ value: o.label, label: o.label })),
            (val) => handleInputChange('loaiCuaHang', val)
          )}
        </section>

        {/* Section 2: Vị trí */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <span className="material-symbols-outlined text-primary text-[18px]">location_on</span>
            <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
              Vị trí
            </h4>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Quận huyện - từ API */}
            {renderSelect(
              'Quận huyện',
              formData.district || '',
              quanHuyenList.map(qh => ({ value: qh.tenQuanHuyen, label: qh.tenQuanHuyen })),
              handleQuanHuyenChange,
              true,
              false,
              '-- Chọn quận/huyện --'
            )}

            {/* Tỉnh thành - từ API, auto-fill */}
            {renderSelect(
              'Tỉnh thành',
              formData.city || '',
              tinhThanhList.map(tt => ({ value: tt.tenTinhThanh, label: tt.tenTinhThanh })),
              (val) => {
                handleInputChange('city', val);
                handleInputChange('supervisor', getSupervisorByCity(val));
              },
              true,
              !isAdmin,
              '-- Tự động --'
            )}
          </div>
        </section>

        {/* Section 3: Ngành nghề & Thương mại */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <span className="material-symbols-outlined text-primary text-[18px]">business</span>
            <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
              Ngành nghề & Thương mại
            </h4>
          </div>

          {/* Ngành nghề chi tiết - từ API */}
          {renderSelect(
            'Ngành nghề chi tiết',
            formData.detailedIndustry || '',
            nganhNgheOptions.map(o => ({ value: o.label, label: o.label })),
            (val) => handleInputChange('detailedIndustry', val),
            true,
            !isAdmin
          )}

          {/* Tên thương mại - Default WeShop, KHÔNG cho sửa */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1">
              Tên thương mại
              <span className="text-red-500">*</span>
              <span className="text-[10px] text-emerald-500 ml-1">(Mặc định)</span>
            </label>
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
              <span className="material-symbols-outlined text-[18px] text-emerald-600">store</span>
              <span className="text-sm text-emerald-700 dark:text-emerald-300 font-bold">
                {DEFAULT_TEN_THUONG_MAI}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Ngành chủ lực - từ API */}
            {renderSelect(
              'Ngành chủ lực',
              formData.keyIndustry || '',
              nganhHangOptions.map(o => ({ value: o.label, label: o.label })),
              (val) => handleInputChange('keyIndustry', val),
              true
            )}

            {/* Ngành phụ - từ API */}
            {renderSelect(
              'Ngành phụ',
              formData.subIndustry || '',
              nganhHangOptions.map(o => ({ value: o.label, label: o.label })),
              (val) => handleInputChange('subIndustry', val)
            )}
          </div>

          {/* Điều khoản thanh toán - từ API */}
          {renderSelect(
            'Điều khoản thanh toán',
            formData.paymentTerms || '',
            dieuKhoanThanhToanOptions.map(o => ({ value: o.label, label: o.label })),
            (val) => handleInputChange('paymentTerms', val),
            true
          )}
        </section>

        {/* Section 4: Nhân sự phụ trách */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <span className="material-symbols-outlined text-primary text-[18px]">groups</span>
            <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
              Nhân sự phụ trách
            </h4>
          </div>

          {/* Supervisor - Auto-fill theo Tỉnh/Thành */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1">
              Supervisor
              <span className="text-[10px] text-emerald-500 ml-1">(Tự động theo Tỉnh/Thành)</span>
            </label>
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-800/60 dark:to-slate-800/40 border border-slate-200 dark:border-slate-700">
              <span className="material-symbols-outlined text-[18px] text-primary">supervisor_account</span>
              <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">
                {formData.supervisor || '(Chọn Quận/Huyện để tự động điền)'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Nhân viên Sale - Text input cho phép tự nhập */}
            {renderInput('Nhân viên Sale', 'salesStaff', 'text', false, !isAdmin, 'Nhập tên NV sale...')}

            {/* Nhân viên Công nợ - từ API */}
            {renderSelect(
              'Nhân viên Công nợ',
              formData.debtStaff || '',
              nhanVienCongNoList.map(e => ({ value: e.name, label: e.name })),
              (val) => handleInputChange('debtStaff', val),
              true
            )}
          </div>
        </section>

        {/* Section 5: Đánh giá ban đầu */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <span className="material-symbols-outlined text-primary text-[18px]">analytics</span>
            <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
              Đánh giá ban đầu
            </h4>
          </div>

          {/* Tiềm năng ban đầu - từ API */}
          {renderSelect(
            'Tiềm năng ban đầu',
            formData.initialPotential || '',
            tiemNangOptions.map(o => ({ value: o.label, label: o.label })),
            (val) => handleInputChange('initialPotential', val),
            true
          )}

          {renderTextarea('Thông tin chung ban đầu', 'initialGeneralInfo', false, 3)}
          {renderTextarea('Mô tả người đại diện', 'repDescription', true, 3)}
        </section>

      </div>

      {/* Sidebar Footer */}
      <div className="p-5 border-t border-slate-200 dark:border-slate-800 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800/50 dark:to-slate-900 flex flex-col gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full h-12 rounded-xl bg-gradient-to-r from-primary to-primary/90 text-white font-bold shadow-lg shadow-primary/30 hover:shadow-primary/40 hover:from-primary/90 hover:to-primary/80 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <>
              <span className="material-symbols-outlined text-[20px] animate-spin">sync</span>
              Đang lưu...
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[20px]">save</span>
              Lưu thông tin
            </>
          )}
        </button>
        <button
          onClick={onClose}
          className="w-full py-2.5 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 text-sm font-medium transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
        >
          Hủy
        </button>
      </div>
    </aside>
  );
};

export default CustomerSidebar;