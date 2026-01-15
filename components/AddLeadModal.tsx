import React, { useState, useEffect } from 'react';
import { Lead } from '../types';
import {
  fetchQuanHuyen,
  QuanHuyen,
} from '../services/ReferenceDataService';

interface AddLeadModalProps {
  onClose: () => void;
  onSave: (newLead: Partial<Lead>) => Promise<void>;
  saving?: boolean;
}

const AddLeadModal: React.FC<AddLeadModalProps> = ({ onClose, onSave, saving = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    taxCode: '',
    source: 'Facebook Ads',
    district: '',
    districtId: '',
    city: '',
    cityId: ''
  });

  const [quanHuyenList, setQuanHuyenList] = useState<QuanHuyen[]>([]);
  const [loadingLookup, setLoadingLookup] = useState(true);

  const [validationErrors, setValidationErrors] = useState<{
    phone?: string;
    taxCode?: string;
  }>({});

  // Load Quận/Huyện lookup
  useEffect(() => {
    loadQuanHuyenData();
  }, []);

  const loadQuanHuyenData = async () => {
    try {
      setLoadingLookup(true);
      const quanHuyen = await fetchQuanHuyen();
      setQuanHuyenList(quanHuyen);
      console.log('✅ Loaded', quanHuyen.length, 'Quận/Huyện for AddLeadModal');
    } catch (error) {
      console.error('❌ Error loading Quận/Huyện:', error);
    } finally {
      setLoadingLookup(false);
    }
  };

  // Auto-fill Tỉnh/Thành when Quận/Huyện is selected
  const handleDistrictChange = (districtId: string) => {
    // Find the selected district
    const selectedDistrict = quanHuyenList.find(q => q.id === districtId);
    
    if (selectedDistrict) {
      handleChange('districtId', districtId);
      handleChange('district', selectedDistrict.tenQuanHuyen);
      handleChange('cityId', selectedDistrict.tinhThanhId);
      handleChange('city', selectedDistrict.tinhThanhName);
    } else {
      handleChange('districtId', '');
      handleChange('district', '');
      handleChange('cityId', '');
      handleChange('city', '');
    }
  };

  const validatePhone = (phone: string): string | undefined => {
    if (!phone) return 'Số điện thoại là bắt buộc';
    const phoneRegex = /^[0-9]{9,11}$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
      return 'Số điện thoại không hợp lệ (9-11 số)';
    }
    return undefined;
  };

  const validateTaxCode = (taxCode: string): string | undefined => {
    if (!taxCode) return undefined; // Tax code is optional
    const taxCodeRegex = /^[0-9]{10}$|^[0-9]{13}$/;
    if (!taxCodeRegex.test(taxCode)) {
      return 'Mã số thuế phải là 10 hoặc 13 chữ số';
    }
    return undefined;
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear validation error when user types
    if (field === 'phone' || field === 'taxCode') {
      setValidationErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    const phoneError = validatePhone(formData.phone);
    const taxCodeError = validateTaxCode(formData.taxCode);

    if (phoneError || taxCodeError) {
      setValidationErrors({
        phone: phoneError,
        taxCode: taxCodeError
      });
      return;
    }

    // Prepare data
    const newLeadData: Partial<Lead> = {
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      address: formData.address.trim(),
      taxCode: formData.taxCode.trim(),
      source: formData.source,
      district: formData.district,
      districtId: formData.districtId || undefined, // GUID for lookup
      city: formData.city,
      cityId: formData.cityId || undefined, // GUID for lookup
      status: 'Marketing đã xác nhận', // Auto set status
    };

    await onSave(newLeadData);
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-fade-in"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div 
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-hidden pointer-events-auto animate-slide-up"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b-2 border-slate-200 dark:border-slate-800 bg-gradient-to-r from-blue-50 to-violet-50 dark:from-blue-900/20 dark:to-violet-900/20">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center shadow-lg">
                <span className="material-symbols-outlined text-white text-2xl">person_add</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Thêm Khách Hàng Mới</h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">Nhập thông tin khách hàng tiềm năng</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-800 transition-all hover:scale-110"
              disabled={saving}
            >
              <span className="material-symbols-outlined text-slate-600 dark:text-slate-400 text-xl">close</span>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(85vh-220px)]">
            <div className="space-y-5">
              {/* Tên khách hàng */}
              <div>
                <label className="block text-sm font-bold text-slate-900 dark:text-white mb-2">
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">person</span>
                    Tên khách hàng <span className="text-red-500">*</span>
                  </span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  placeholder="Nhập tên khách hàng"
                  required
                  disabled={saving}
                />
              </div>

              {/* Số điện thoại */}
              <div>
                <label className="block text-sm font-bold text-slate-900 dark:text-white mb-2">
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">call</span>
                    Số điện thoại <span className="text-red-500">*</span>
                  </span>
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border-2 ${
                    validationErrors.phone 
                      ? 'border-red-500 dark:border-red-500 bg-red-50/50 dark:bg-red-900/10' 
                      : 'border-slate-200 dark:border-slate-700'
                  } bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all`}
                  placeholder="0123456789"
                  required
                  disabled={saving}
                />
                {validationErrors.phone && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1.5 font-medium">
                    <span className="material-symbols-outlined text-base">error</span>
                    {validationErrors.phone}
                  </p>
                )}
              </div>

              {/* Địa chỉ */}
              <div>
                <label className="block text-sm font-bold text-slate-900 dark:text-white mb-2">
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">location_on</span>
                    Địa chỉ
                  </span>
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                  placeholder="Nhập địa chỉ chi tiết (số nhà, đường)"
                  rows={2}
                  disabled={saving}
                />
              </div>

              {/* Quận/Huyện và Tỉnh/Thành */}
              <div className="grid grid-cols-2 gap-4">
                {/* Quận/Huyện */}
                <div>
                  <label className="block text-sm font-bold text-slate-900 dark:text-white mb-2">
                    <span className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-lg">map</span>
                      Quận/Huyện
                    </span>
                  </label>
                  <select
                    value={formData.districtId}
                    onChange={(e) => handleDistrictChange(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                    disabled={saving || loadingLookup}
                  >
                    <option value="">
                      {loadingLookup ? '⏳ Đang tải...' : quanHuyenList.length === 0 ? '❌ Không có dữ liệu' : '-- Chọn quận/huyện --'}
                    </option>
                    {quanHuyenList.map(qh => (
                      <option key={qh.id} value={qh.id}>
                        {qh.tenQuanHuyen}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tỉnh/Thành */}
                <div>
                  <label className="block text-sm font-bold text-slate-900 dark:text-white mb-2">
                    <span className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-lg">location_city</span>
                      Tỉnh/Thành
                    </span>
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-medium cursor-not-allowed"
                    placeholder="Tự động điền"
                    disabled
                    readOnly
                  />
                </div>
              </div>

              {/* Mã số thuế */}
              <div>
                <label className="block text-sm font-bold text-slate-900 dark:text-white mb-2">
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">badge</span>
                    Mã số thuế
                  </span>
                </label>
                <input
                  type="text"
                  value={formData.taxCode}
                  onChange={(e) => handleChange('taxCode', e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border-2 ${
                    validationErrors.taxCode 
                      ? 'border-red-500 dark:border-red-500 bg-red-50/50 dark:bg-red-900/10' 
                      : 'border-slate-200 dark:border-slate-700'
                  } bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all`}
                  placeholder="10 hoặc 13 chữ số"
                  disabled={saving}
                />
                {validationErrors.taxCode && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1.5 font-medium">
                    <span className="material-symbols-outlined text-base">error</span>
                    {validationErrors.taxCode}
                  </p>
                )}
              </div>

              {/* Nguồn */}
              <div>
                <label className="block text-sm font-bold text-slate-900 dark:text-white mb-2">
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">campaign</span>
                    Nguồn <span className="text-red-500">*</span>
                  </span>
                </label>
                <select
                  value={formData.source}
                  onChange={(e) => handleChange('source', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                  required
                  disabled={saving}
                >
                  <option value="Facebook Ads">Facebook Ads</option>
                  <option value="TikTok Ads">TikTok Ads</option>
                  <option value="Google Ads">Google Ads</option>
                  <option value="Facebook Messenger Organic">FB Messenger</option>
                  <option value="Zalo">Zalo</option>
                  <option value="Website Form">Website Form</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Status info */}
              <div className="p-4 bg-gradient-to-r from-blue-50 to-violet-50 dark:from-blue-900/20 dark:to-violet-900/20 rounded-xl border-2 border-blue-200/60 dark:border-blue-800/60">
                <p className="text-sm text-blue-900 dark:text-blue-300 flex items-center gap-2 font-medium">
                  <span className="material-symbols-outlined text-lg">info</span>
                  <span>Trạng thái sẽ tự động được đặt là: <strong className="font-bold">"Marketing đã xác nhận"</strong></span>
                </p>
              </div>
            </div>
          </form>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-5 border-t-2 border-slate-200 dark:border-slate-800 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-800/80">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-xl border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-700 hover:scale-105 transition-all duration-200"
              disabled={saving}
            >
              Hủy
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={saving || !formData.name || !formData.phone}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 dark:from-blue-600 dark:to-violet-600 text-white font-bold shadow-xl shadow-blue-500/40 hover:shadow-2xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2"
            >
              {saving ? (
                <>
                  <span className="material-symbols-outlined text-lg animate-spin">sync</span>
                  <span>Đang lưu...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-lg">check_circle</span>
                  <span>Thêm khách hàng</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddLeadModal;
