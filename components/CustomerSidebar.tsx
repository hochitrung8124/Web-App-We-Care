import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import ConfirmModal from './ConfirmModal';
import { Lead } from '../types';
import {
  fetchQuanHuyen,
  fetchTinhThanh,
  fetchNhanVienCongNo,
  fetchNhanVienSale,
  fetchNhanVienSaleByTinhThanh,
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
  onReject?: (leadId: string) => void; // Callback for "Khách hàng không hợp tác"
  saving?: boolean;
  isAdmin?: boolean;
  department?: 'SALE' | 'MARKETING' | null; // Marketing chỉ edit Tên, SĐT, Địa chỉ, MST
}

// Default value - không cho chỉnh sửa
const DEFAULT_TEN_THUONG_MAI = 'WeCare';

const CustomerSidebar: React.FC<CustomerSidebarProps> = ({
  lead,
  onClose,
  onSave,
  onReject,
  saving = false,
  isAdmin = false,
  department = null
}) => {
  // Marketing role chỉ được edit một số trường cơ bản
  const isMarketing = department === 'MARKETING';
  
  // Check if lead is editable (only "Chờ xác nhận" status for Marketing)
  const isEditable = !isMarketing || (lead?.status === 'Chờ xác nhận' || lead?.status === 'Đợi xác nhận');
  
  const [formData, setFormData] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);

  // Reference data states
  const [quanHuyenList, setQuanHuyenList] = useState<QuanHuyen[]>([]);
  const [tinhThanhList, setTinhThanhList] = useState<TinhThanh[]>([]);
  const [nhanVienCongNoList, setNhanVienCongNoList] = useState<Employee[]>([]);
  const [nhanVienSaleList, setNhanVienSaleList] = useState<Employee[]>([]);
  const [nhanVienSaleFiltered, setNhanVienSaleFiltered] = useState<Employee[]>([]);
  const [loaiCuaHangOptions, setLoaiCuaHangOptions] = useState<ChoiceOption[]>([]);
  const [nganhNgheOptions, setNganhNgheOptions] = useState<ChoiceOption[]>([]);
  const [dieuKhoanThanhToanOptions, setDieuKhoanThanhToanOptions] = useState<ChoiceOption[]>([]);
  const [tiemNangOptions, setTiemNangOptions] = useState<ChoiceOption[]>([]);
  const [nganhHangOptions, setNganhHangOptions] = useState<ChoiceOption[]>([]);

  // Validation errors
  const [validationErrors, setValidationErrors] = useState<{
    phone?: string;
    taxCode?: string;
    district?: string;
  }>({});

  // Reject confirmation modal state
  const [showRejectModal, setShowRejectModal] = useState(false);

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
      // Khởi tạo filtered list với tất cả nhân viên sale
      setNhanVienSaleFiltered(nvSale);
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

      // Reset validation errors when form data changes
      setValidationErrors({});
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

  // Load nhân viên sale filter theo tỉnh thành khi tỉnh thành thay đổi
  // PHẢI đặt TRƯỚC return null để tuân thủ Rules of Hooks
  useEffect(() => {
    // Chỉ chạy khi formData đã sẵn sàng
    if (!formData) {
      return;
    }

    // Nếu chưa có danh sách nhân viên sale, set empty array
    if (!nhanVienSaleList || nhanVienSaleList.length === 0) {
      console.log('⚠️ Chưa có danh sách nhân viên sale, đang load lại...');
      setNhanVienSaleFiltered([]);
      // Nếu có tỉnh thành nhưng chưa có danh sách, thử load lại
      if (formData.city) {
        fetchNhanVienSaleByTinhThanh(formData.city)
          .then(nvSale => {
            console.log('✅ Loaded', nvSale.length, 'nhân viên sale cho', formData.city);
            setNhanVienSaleFiltered(nvSale);
          })
          .catch(error => {
            console.error('❌ Error loading nhân viên sale by tỉnh thành:', error);
            setNhanVienSaleFiltered([]);
          });
      }
      return;
    }

    // Nếu có tỉnh thành, load filter; nếu không, dùng tất cả
    if (formData.city) {
      console.log('🔍 Filtering nhân viên sale theo tỉnh thành:', formData.city);
      fetchNhanVienSaleByTinhThanh(formData.city)
        .then(nvSale => {
          console.log('✅ Found', nvSale.length, 'nhân viên sale cho', formData.city);
          // Nếu không có nhân viên nào match, vẫn hiển thị tất cả để user có thể chọn
          if (nvSale.length > 0) {
            setNhanVienSaleFiltered(nvSale);
          } else {
            console.warn('⚠️ Không có nhân viên sale nào cho tỉnh thành này, hiển thị tất cả');
            setNhanVienSaleFiltered(nhanVienSaleList);
          }
        })
        .catch(error => {
          console.error('❌ Error loading nhân viên sale by tỉnh thành:', error);
          // Fallback về danh sách đầy đủ nếu có lỗi
          setNhanVienSaleFiltered(nhanVienSaleList);
        });
    } else {
      console.log('📋 Chưa có tỉnh thành, hiển thị tất cả nhân viên sale:', nhanVienSaleList.length);
      setNhanVienSaleFiltered(nhanVienSaleList);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData?.city]);

  if (!lead || !formData) return null;

  // Validation functions
  const validatePhone = (phone: string): string | undefined => {
    if (!phone || phone.trim() === '') {
      return undefined; // Empty is OK (will be handled by required validation)
    }

    // Remove spaces
    const cleaned = phone.replace(/\s/g, '');

    // Check if starts with 0 followed by 9 digits
    if (/^0\d{9}$/.test(cleaned)) {
      return undefined; // Valid: 0 + 9 digits = 10 total
    }

    // Check if starts with +84 followed by 9 digits
    if (/^\+84\d{9}$/.test(cleaned)) {
      return undefined; // Valid: +84 + 9 digits = 12 total
    }

    return 'Số điện thoại phải có 10 số (0 + 9 số) hoặc 12 số (+84 + 9 số)';
  };

  const validateTaxCode = (taxCode: string): string | undefined => {
    if (!taxCode || taxCode.trim() === '' || taxCode === 'N/A') {
      return undefined; // Empty or N/A is OK
    }

    // Remove spaces and dashes
    const cleaned = taxCode.replace(/[\s-]/g, '');

    // Check if it's exactly 10, 12, or 13 digits
    if (/^\d{10}$/.test(cleaned) || /^\d{12}$/.test(cleaned) || /^\d{13}$/.test(cleaned)) {
      return undefined; // Valid
    }

    return 'Mã số thuế phải có 10, 12 hoặc 13 số';
  };

  const handleInputChange = (field: keyof Lead, value: any) => {
    setFormData(prev => prev ? { ...prev, [field]: value } : null);

    // Validate on change
    if (field === 'phone') {
      const error = validatePhone(value);
      setValidationErrors(prev => ({ ...prev, phone: error }));
    } else if (field === 'taxCode') {
      const error = validateTaxCode(value);
      setValidationErrors(prev => ({ ...prev, taxCode: error }));
    }
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
    if (!formData) return;

    // Validate before saving
    const phoneError = validatePhone(formData.phone || '');
    const taxCodeError = validateTaxCode(formData.taxCode || '');

    // Check required fields
    if (!formData.phone || formData.phone.trim() === '') {
      toast.error('Vui lòng nhập số điện thoại', {
        duration: 5000,
        icon: '⚠️',
      });
      return;
    }

    // Check district required
    if (!formData.district || formData.district.trim() === '' || formData.district === 'N/A') {
      setValidationErrors(prev => ({ ...prev, district: 'Vui lòng chọn quận/huyện' }));
      toast.error('Vui lòng chọn Quận/Huyện', {
        duration: 5000,
        icon: '⚠️',
      });
      return;
    } else {
      setValidationErrors(prev => ({ ...prev, district: undefined }));
    }

    // Set validation errors
    const errors: { phone?: string; taxCode?: string } = {};
    if (phoneError) errors.phone = phoneError;
    if (taxCodeError) errors.taxCode = taxCodeError;

    setValidationErrors(errors);

    // If there are validation errors, show toast and don't save
    if (phoneError || taxCodeError) {
      toast.error('Vui lòng kiểm tra lại thông tin đã nhập', {
        duration: 5000,
        icon: '❌',
      });
      return;
    }

    // All validations passed, proceed with save
    onSave(formData);
  };

  // Render select with dynamic options
  const renderSelect = (
    label: string,
    value: string,
    options: { value: string | number, label: string, key?: string }[],
    onChange: (val: string) => void,
    required: boolean = false,
    disabled: boolean = false,
    placeholder: string = '-- Chọn --',
    fieldName?: 'phone' | 'taxCode' | 'district'  // Optional field for validation
  ) => {
    const error = fieldName ? validationErrors[fieldName] : undefined;
    const hasError = !!error;

    return (
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1">
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
        <select
          className={`form-select w-full rounded-lg text-sm py-2.5 px-3 outline-none border transition-all
            ${disabled
              ? 'border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/60 text-slate-500 cursor-not-allowed'
              : hasError
                ? 'border-red-500 dark:border-red-500 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-red-500/20 focus:border-red-500'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary'
            }`}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
        >
          <option value="">{placeholder}</option>
          {options.map((opt, idx) => (
            <option key={opt.key || `${opt.value}-${idx}`} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        {hasError && (
          <p className="text-xs text-red-500 dark:text-red-400 flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">error</span>
            {error}
          </p>
        )}
      </div>
    );
  };

  // Render text input
  const renderInput = (
    label: string,
    field: keyof Lead,
    type: string = 'text',
    required: boolean = false,
    readOnly: boolean = false,
    placeholder: string = ''
  ) => {
    const error = validationErrors[field as 'phone' | 'taxCode' | 'district'];
    const hasError = !!error;
    const isFieldDisabled = readOnly || !isEditable;

    return (
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1">
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
        <input
          className={`form-input w-full rounded-lg text-sm py-2.5 px-3 outline-none border transition-all
            ${isFieldDisabled
              ? 'border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/60 text-slate-500 cursor-not-allowed'
              : hasError
                ? 'border-red-500 dark:border-red-500 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-red-500/20 focus:border-red-500'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary'
            }`}
          type={type}
          value={(formData[field] as string) || ''}
          onChange={(e) => handleInputChange(field, e.target.value)}
          readOnly={isFieldDisabled}
          disabled={isFieldDisabled}
          placeholder={placeholder}
        />
        {hasError && (
          <p className="text-xs text-red-500 dark:text-red-400 flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">error</span>
            {error}
          </p>
        )}
      </div>
    );
  };

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
        className={`form-textarea w-full rounded-lg text-sm py-2.5 px-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none border resize-none transition-all ${
          !isEditable 
            ? 'border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/60 text-slate-500 cursor-not-allowed'
            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
        }`}
        value={(formData[field] as string) || ''}
        onChange={(e) => handleInputChange(field, e.target.value)}
        disabled={!isEditable}
        rows={rows}
      />
    </div>
  );

  // Render multiple choice (checkbox list)
  const renderMultipleChoice = (
    label: string,
    field: keyof Lead,
    options: { value: number | string; label: string }[],
    required: boolean = false,
    useLabels: boolean = true // Nếu true, lưu labels; nếu false, lưu values
  ) => {
    // Parse current value (comma-separated string) to array
    const currentValue = (formData[field] as string) || '';
    const selectedValues: string[] = currentValue
      ? currentValue.split(',').map(v => v.trim()).filter(v => v)
      : [];

    const handleToggle = (value: number | string, label: string) => {
      // Nếu useLabels = true, lưu label; nếu false, lưu value
      const valueToStore = useLabels ? label : String(value);
      const newSelected = selectedValues.includes(valueToStore)
        ? selectedValues.filter((v: string) => v !== valueToStore)
        : [...selectedValues, valueToStore];

      // Join array back to comma-separated string
      handleInputChange(field, newSelected.join(', '));
    };

    return (
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1">
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
        <div className="border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 p-3 max-h-48 overflow-y-auto custom-scrollbar">
          <div className="flex flex-col gap-2">
            {options.map((option) => {
              // Nếu useLabels = true, so sánh với label; nếu false, so sánh với value
              const valueToCompare = useLabels ? option.label : String(option.value);
              const isSelected = selectedValues.includes(valueToCompare);
              return (
                <label
                  key={option.value}
                  className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg p-2 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleToggle(option.value, option.label)}
                    className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-primary focus:ring-2 focus:ring-primary/20 cursor-pointer"
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300">
                    {option.label}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // Show loading state
  if (loading) {
    return (
      <aside className="w-full md:w-[420px] flex-shrink-0 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col h-full shadow-2xl z-40 absolute right-0 top-0 bottom-0 md:relative items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-sm text-slate-500">Đang tải dữ liệu...</p>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-full md:w-[420px] flex-shrink-0 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col h-full shadow-2xl z-40 absolute right-0 top-0 bottom-0 md:relative">
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

          {/* Marketing chỉ được edit: Tên, SĐT, MST, Địa chỉ */}
          {renderInput('Tên khách hàng', 'name', 'text', true)}
          {renderInput('Điện thoại', 'phone', 'tel', true)}
          {renderInput('Mã số thuế (MST)', 'taxCode', 'text')}
          {renderTextarea('Địa chỉ', 'address', true, 2)}

          {/* Các trường sau chỉ hiển thị cho Sale, ẩn với Marketing */}
          {!isMarketing && renderInput('Ngày sinh', 'birthDate', 'date')}

          {/* Loại cửa hàng - chỉ hiển thị cho Sale - sử dụng choice value (số) */}
          {!isMarketing && renderSelect(
            'Loại cửa hàng',
            formData.loaiCuaHang || '',
            loaiCuaHangOptions.map(o => ({ value: String(o.value), label: o.label })),
            (val) => handleInputChange('loaiCuaHang', val)
          )}
        </section>

        {/* Section 2: Vị trí - Hiển thị cho cả Marketing và Sale */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <span className="material-symbols-outlined text-primary text-[18px]">location_on</span>
            <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
              Vị trí
            </h4>
            {quanHuyenList.length === 0 && (
              <span className="text-[10px] text-amber-500 ml-auto">(Nhập thủ công)</span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Quận huyện - dropdown if list available, otherwise text input */}
            {quanHuyenList.length > 0 ? (
              renderSelect(
                'Quận huyện',
                formData.district || '',
                quanHuyenList.map(qh => ({ value: qh.tenQuanHuyen, label: qh.tenQuanHuyen })),
                (val) => {
                  handleInputChange('district', val);
                  // Clear validation error when user selects
                  setValidationErrors(prev => ({ ...prev, district: undefined }));
                  // Auto-fill Tỉnh thành từ Quận huyện
                  const selectedQH = quanHuyenList.find(qh => qh.tenQuanHuyen === val);
                  if (selectedQH) {
                    handleInputChange('city', selectedQH.tinhThanhName);
                    // Auto-fill Supervisor từ Tỉnh thành
                    if (!isMarketing) {
                      handleInputChange('supervisor', getSupervisorByCity(selectedQH.tinhThanhName));
                    }
                  }
                },
                true,
                false,
                '-- Chọn quận/huyện --',
                'district'  // fieldName for validation
              )
            ) : (
              renderInput('Quận huyện', 'district', 'text', true, false, 'Nhập quận/huyện')
            )}

            {/* Tỉnh thành - Dropdown if list available; editable if quanHuyenList empty */}
            {quanHuyenList.length > 0 ? (
              renderSelect(
                'Tỉnh thành',
                formData.city || '',
                tinhThanhList.map(tt => ({ value: tt.tenTinhThanh, label: tt.tenTinhThanh })),
                (val) => {
                  handleInputChange('city', val);
                  if (!isMarketing) {
                    handleInputChange('supervisor', getSupervisorByCity(val));
                  }
                },
                true,
                true, // Readonly - tự động điền từ Quận/Huyện
                '-- Tự động --'
              )
            ) : (
              // When Quận/Huyện API fails, allow selecting Tỉnh/Thành from dropdown
              tinhThanhList.length > 0 ? (
                renderSelect(
                  'Tỉnh thành',
                  formData.city || '',
                  tinhThanhList.map(tt => ({ value: tt.tenTinhThanh, label: tt.tenTinhThanh })),
                  (val) => {
                    handleInputChange('city', val);
                    if (!isMarketing) {
                      handleInputChange('supervisor', getSupervisorByCity(val));
                    }
                  },
                  true,
                  false, // Editable when in fallback mode
                  '-- Chọn tỉnh thành --'
                )
              ) : (
                renderInput('Tỉnh thành', 'city', 'text', true, false, 'Nhập tỉnh/thành')
              )
            )}
          </div>
        </section>

        {/* Các section sau chỉ hiển thị cho Sale, ẩn hoàn toàn với Marketing */}
        {!isMarketing && (
          <>
            {/* Section 3: Ngành nghề & Thương mại */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="material-symbols-outlined text-primary text-[18px]">business</span>
                <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                  Ngành nghề & Thương mại
                </h4>
              </div>

              {/* Ngành nghề chi tiết - Sale được chỉnh - lưu cả value (số) và label (text) */}
              {renderSelect(
                'Ngành nghề chi tiết',
                formData.detailedIndustry || '',
                nganhNgheOptions.map(o => ({ value: String(o.value), label: o.label })),
                (val) => {
                  handleInputChange('detailedIndustry', val);
                  // Lưu thêm label để hiển thị và mapping
                  const selectedOption = nganhNgheOptions.find(o => String(o.value) === val);
                  handleInputChange('detailedIndustryText', selectedOption?.label || '');
                },
                true,
                false // Sale được chỉnh
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
                {/* Ngành chủ lực - từ API - OptionSet yêu cầu số */}
                {renderSelect(
                  'Ngành chủ lực',
                  formData.keyIndustry || '',
                  nganhHangOptions.map(o => ({ value: String(o.value), label: o.label })),
                  (val) => handleInputChange('keyIndustry', val),
                  true
                )}

                {/* Ngành phụ - Multiple choice (OptionSet - integer values) */}
                {renderMultipleChoice(
                  'Ngành phụ',
                  'subIndustry',
                  nganhHangOptions.map(o => ({ value: o.value, label: o.label })),
                  false,
                  false // useLabels = false để lưu integer values (OptionSet)
                )}
              </div>

              {/* Điều khoản thanh toán - từ API - Text field yêu cầu label (text) */}
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
                {/* Nhân viên Sale - Filter theo Tỉnh/Thành */}
                {renderSelect(
                  'Nhân viên Sale',
                  formData.salesStaff || '',
                  (() => {
                    // Ưu tiên filtered list nếu có và có tỉnh thành
                    const listToUse = (formData.city && nhanVienSaleFiltered && nhanVienSaleFiltered.length > 0)
                      ? nhanVienSaleFiltered
                      : (nhanVienSaleList && nhanVienSaleList.length > 0 ? nhanVienSaleList : []);

                    console.log('📋 Rendering nhân viên sale:', {
                      city: formData.city,
                      filteredCount: nhanVienSaleFiltered?.length || 0,
                      totalCount: nhanVienSaleList?.length || 0,
                      usingList: listToUse.length
                    });

                    return listToUse.map(e => ({ value: e.name, label: e.name }));
                  })(),
                  (val) => handleInputChange('salesStaff', val),
                  true,
                  false,
                  formData.city
                    ? (nhanVienSaleFiltered && nhanVienSaleFiltered.length > 0
                      ? '-- Chọn nhân viên sale --'
                      : '-- Không có nhân viên sale --')
                    : '-- Chọn Tỉnh/Thành trước --'
                )}

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
                tiemNangOptions.map(o => ({ value: String(o.value), label: o.label })),
                (val) => handleInputChange('initialPotential', val),
                true
              )}

              {renderTextarea('Thông tin chung ban đầu', 'initialGeneralInfo', false, 3)}
              {renderTextarea('Mô tả người đại diện', 'repDescription', true, 3)}
            </section>
          </>
        )}

      </div>

      {/* Sidebar Footer */}
      <div className="p-5 border-t border-slate-200 dark:border-slate-800 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800/50 dark:to-slate-900 flex flex-col gap-3">
        {!isEditable && isMarketing && (
          <div className="mb-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <p className="text-sm text-amber-800 dark:text-amber-300 flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">lock</span>
              Chỉ có thể chỉnh sửa khách hàng ở trạng thái "Chờ xác nhận"
            </p>
          </div>
        )}
        
        <button
          onClick={handleSave}
          disabled={saving || !isEditable}
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

        {/* Reject button - Mark as "Khách hàng không hợp tác" */}
        {onReject && (
          <button
            onClick={() => setShowRejectModal(true)}
            disabled={saving || !isEditable}
            className="w-full h-10 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-bold shadow-lg shadow-red-500/20 hover:shadow-red-500/30 hover:from-red-600 hover:to-red-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-[18px]">person_off</span>
            Khách hàng không hợp tác
          </button>
        )}

        <button
          onClick={onClose}
          className="w-full py-2.5 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 text-sm font-medium transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
        >
          Đóng
        </button>
      </div>

      {/* Reject Confirmation Modal */}
      <ConfirmModal
        isOpen={showRejectModal}
        title="Xác nhận hủy khách hàng"
        message={`Bạn có chắc chắn muốn đánh dấu khách hàng "${lead?.name || ''}" là "Khách hàng không hợp tác"? Hành động này sẽ cập nhật trạng thái trong hệ thống.`}
        confirmText="Xác nhận hủy"
        cancelText="Quay lại"
        type="danger"
        onConfirm={() => {
          if (lead && onReject) {
            onReject(lead.id);
            setShowRejectModal(false);
          }
        }}
        onCancel={() => setShowRejectModal(false)}
      />
    </aside>
  );
};

export default CustomerSidebar;