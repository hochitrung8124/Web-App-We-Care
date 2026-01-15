import React from 'react';
import { Notification } from './NotificationContext';

interface NotificationDetailModalProps {
  notification: Notification;
  onClose: () => void;
}

export const NotificationDetailModal: React.FC<NotificationDetailModalProps> = ({ notification, onClose }) => {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'add': return 'person_add';
      case 'update': return 'edit';
      case 'import': return 'upload_file';
      case 'error': return 'error';
      default: return 'notifications';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'add': return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/40';
      case 'update': return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/40';
      case 'import': return 'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/40';
      case 'error': return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/40';
      default: return 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-900/40';
    }
  };

  const customerData = notification.customerData;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-slate-900 dark:to-slate-800">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getTypeColor(notification.type)}`}>
              <span className="material-symbols-outlined text-2xl">{getTypeIcon(notification.type)}</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Chi tiết thông báo
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {formatDate(notification.timestamp)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-all hover:scale-105"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Notification Info */}
          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4">
            <h3 className="font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">info</span>
              Thông tin thông báo
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-slate-600 dark:text-slate-400">Người thực hiện:</span>
                <p className="font-semibold text-slate-900 dark:text-white">{notification.user}</p>
              </div>
              <div>
                <span className="text-slate-600 dark:text-slate-400">Bộ phận:</span>
                <p className="font-semibold text-slate-900 dark:text-white">{notification.department}</p>
              </div>
              <div className="col-span-2">
                <span className="text-slate-600 dark:text-slate-400">Nội dung:</span>
                <p className="font-semibold text-slate-900 dark:text-white">{notification.message}</p>
              </div>
            </div>
          </div>

          {/* Customer Details */}
          {customerData && (
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-900/50 dark:to-slate-800/50 rounded-xl p-5 border border-blue-100 dark:border-slate-700">
              <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2 text-lg">
                <span className="material-symbols-outlined">person</span>
                Thông tin khách hàng
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                {/* Tên khách hàng */}
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide flex items-center gap-1.5 mb-1">
                    <span className="material-symbols-outlined text-sm">badge</span>
                    Tên khách hàng
                  </label>
                  <p className="text-base font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-800 px-3 py-2 rounded-lg">
                    {customerData.name || 'N/A'}
                  </p>
                </div>

                {/* Số điện thoại */}
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide flex items-center gap-1.5 mb-1">
                    <span className="material-symbols-outlined text-sm">phone</span>
                    Số điện thoại
                  </label>
                  <p className="text-sm font-medium text-slate-900 dark:text-white bg-white dark:bg-slate-800 px-3 py-2 rounded-lg">
                    {customerData.phone || 'N/A'}
                  </p>
                </div>

                {/* Email */}
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide flex items-center gap-1.5 mb-1">
                    <span className="material-symbols-outlined text-sm">email</span>
                    Email
                  </label>
                  <p className="text-sm font-medium text-slate-900 dark:text-white bg-white dark:bg-slate-800 px-3 py-2 rounded-lg">
                    {customerData.email || 'N/A'}
                  </p>
                </div>

                {/* Mã số thuế */}
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide flex items-center gap-1.5 mb-1">
                    <span className="material-symbols-outlined text-sm">receipt_long</span>
                    Mã số thuế
                  </label>
                  <p className="text-sm font-medium text-slate-900 dark:text-white bg-white dark:bg-slate-800 px-3 py-2 rounded-lg">
                    {customerData.taxCode || 'N/A'}
                  </p>
                </div>

                {/* Nguồn */}
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide flex items-center gap-1.5 mb-1">
                    <span className="material-symbols-outlined text-sm">source</span>
                    Nguồn
                  </label>
                  <p className="text-sm font-medium text-slate-900 dark:text-white bg-white dark:bg-slate-800 px-3 py-2 rounded-lg">
                    {customerData.source || 'N/A'}
                  </p>
                </div>

                {/* Địa chỉ */}
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide flex items-center gap-1.5 mb-1">
                    <span className="material-symbols-outlined text-sm">location_on</span>
                    Địa chỉ
                  </label>
                  <p className="text-sm font-medium text-slate-900 dark:text-white bg-white dark:bg-slate-800 px-3 py-2 rounded-lg">
                    {customerData.address || 'N/A'}
                  </p>
                </div>

                {/* Quận/Huyện */}
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide flex items-center gap-1.5 mb-1">
                    <span className="material-symbols-outlined text-sm">map</span>
                    Quận/Huyện
                  </label>
                  <p className="text-sm font-medium text-slate-900 dark:text-white bg-white dark:bg-slate-800 px-3 py-2 rounded-lg">
                    {customerData.district || 'N/A'}
                  </p>
                </div>

                {/* Tỉnh/Thành */}
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide flex items-center gap-1.5 mb-1">
                    <span className="material-symbols-outlined text-sm">location_city</span>
                    Tỉnh/Thành
                  </label>
                  <p className="text-sm font-medium text-slate-900 dark:text-white bg-white dark:bg-slate-800 px-3 py-2 rounded-lg">
                    {customerData.city || 'N/A'}
                  </p>
                </div>

                {/* Trạng thái */}
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide flex items-center gap-1.5 mb-1">
                    <span className="material-symbols-outlined text-sm">flag</span>
                    Trạng thái
                  </label>
                  <p className="text-sm font-medium text-slate-900 dark:text-white bg-white dark:bg-slate-800 px-3 py-2 rounded-lg">
                    {customerData.status || 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error Details */}
          {notification.errorDetails && (
            <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 border border-red-200 dark:border-red-800">
              <h3 className="font-bold text-red-900 dark:text-red-300 mb-2 flex items-center gap-2">
                <span className="material-symbols-outlined">error</span>
                Chi tiết lỗi
              </h3>
              <p className="text-sm text-red-800 dark:text-red-400 font-mono bg-red-100 dark:bg-red-900/40 p-3 rounded-lg">
                {notification.errorDetails}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-900 dark:text-white font-semibold transition-all hover:scale-105"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
