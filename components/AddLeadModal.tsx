import React, { useState } from 'react';
import { Lead } from '../types';

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
    source: 'Facebook Ads'
  });

  const [validationErrors, setValidationErrors] = useState<{
    phone?: string;
    taxCode?: string;
  }>({});

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
          <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-blue-50 to-violet-50 dark:from-blue-900/20 dark:to-violet-900/20">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-lg">person_add</span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Thêm Khách Hàng Mới</h2>
                <p className="text-xs text-slate-600 dark:text-slate-400">Nhập thông tin khách hàng tiềm năng</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
              disabled={saving}
            >
              <span className="material-symbols-outlined text-slate-600 dark:text-slate-400">close</span>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-5 overflow-y-auto max-h-[calc(85vh-220px)]">
            <div className="space-y-4">
              {/* Tên khách hàng */}
              <div>
                <label className="block text-xs font-semibold text-slate-900 dark:text-white mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base">person</span>
                    Tên khách hàng <span className="text-red-500">*</span>
                  </span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="Nhập tên khách hàng"
                  required
                  disabled={saving}
                />
              </div>

              {/* Số điện thoại */}
              <div>
                <label className="block text-xs font-semibold text-slate-900 dark:text-white mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base">call</span>
                    Số điện thoại <span className="text-red-500">*</span>
                  </span>
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border-2 ${
                    validationErrors.phone 
                      ? 'border-red-500 dark:border-red-500' 
                      : 'border-slate-200 dark:border-slate-700'
                  } bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all`}
                  placeholder="0123456789"
                  required
                  disabled={saving}
                />
                {validationErrors.phone && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">error</span>
                    {validationErrors.phone}
                  </p>
                )}
              </div>

              {/* Địa chỉ */}
              <div>
                <label className="block text-xs font-semibold text-slate-900 dark:text-white mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base">location_on</span>
                    Địa chỉ
                  </span>
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                  placeholder="Nhập địa chỉ khách hàng"
                  rows={2}
                  disabled={saving}
                />
              </div>

              {/* Mã số thuế */}
              <div>
                <label className="block text-xs font-semibold text-slate-900 dark:text-white mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base">badge</span>
                    Mã số thuế
                  </span>
                </label>
                <input
                  type="text"
                  value={formData.taxCode}
                  onChange={(e) => handleChange('taxCode', e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border-2 ${
                    validationErrors.taxCode 
                      ? 'border-red-500 dark:border-red-500' 
                      : 'border-slate-200 dark:border-slate-700'
                  } bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all`}
                  placeholder="10 hoặc 13 chữ số"
                  disabled={saving}
                />
                {validationErrors.taxCode && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">error</span>
                    {validationErrors.taxCode}
                  </p>
                )}
              </div>

              {/* Nguồn */}
              <div>
                <label className="block text-xs font-semibold text-slate-900 dark:text-white mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base">campaign</span>
                    Nguồn <span className="text-red-500">*</span>
                  </span>
                </label>
                <select
                  value={formData.source}
                  onChange={(e) => handleChange('source', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
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
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-xs text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base">info</span>
                  <span>Trạng thái sẽ tự động được đặt là: <strong>"Marketing đã xác nhận"</strong></span>
                </p>
              </div>
            </div>
          </form>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-5 py-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              disabled={saving}
            >
              Hủy
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={saving || !formData.name || !formData.phone}
              className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-blue-500 to-violet-500 dark:from-blue-600 dark:to-violet-600 text-white text-sm font-semibold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-1.5"
            >
              {saving ? (
                <>
                  <span className="material-symbols-outlined text-base animate-spin">sync</span>
                  Đang lưu...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-base">check</span>
                  Thêm khách hàng
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
