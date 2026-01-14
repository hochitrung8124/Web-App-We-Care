import React from 'react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'danger' | 'warning' | 'info';
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  onConfirm,
  onCancel,
  type = 'info'
}) => {
  if (!isOpen) return null;

  const confirmButtonClass = type === 'danger' 
    ? 'bg-red-600 hover:bg-red-700 text-white'
    : type === 'warning'
    ? 'bg-amber-600 hover:bg-amber-700 text-white'
    : 'bg-primary hover:bg-primary/90 text-white';

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onCancel}
      >
        {/* Modal */}
        <div 
          className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Title */}
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            {title}
          </h3>
          
          {/* Message */}
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {message}
          </p>
          
          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4">
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors font-medium text-sm"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`px-4 py-2 rounded-lg transition-colors font-medium text-sm ${confirmButtonClass}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ConfirmModal;
