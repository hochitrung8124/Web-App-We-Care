import React, { useState } from 'react';

interface RejectModalProps {
    isOpen: boolean;
    customerName: string;
    onConfirm: (note: string) => void;
    onCancel: () => void;
}

const RejectModal: React.FC<RejectModalProps> = ({
    isOpen,
    customerName,
    onConfirm,
    onCancel,
}) => {
    const [note, setNote] = useState('');

    if (!isOpen) return null;

    const handleConfirm = () => {
        onConfirm(note);
        setNote(''); // Reset note after confirm
    };

    const handleCancel = () => {
        setNote(''); // Reset note on cancel
        onCancel();
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
                onClick={handleCancel}
            >
                {/* Modal */}
                <div
                    className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-scaleIn"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                                <span className="material-symbols-outlined text-white text-xl">person_off</span>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">
                                    Khách hàng không hợp tác
                                </h3>
                                <p className="text-red-100 text-sm">
                                    {customerName}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="px-6 py-5 space-y-4">
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Bạn có chắc chắn muốn đánh dấu khách hàng này là "Không hợp tác"?
                            Vui lòng nhập lý do hoặc ghi chú bên dưới.
                        </p>

                        {/* Note Input */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                                <span className="material-symbols-outlined text-[16px]">edit_note</span>
                                Ghi chú / Lý do
                            </label>
                            <textarea
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder="Nhập lý do khách hàng không hợp tác..."
                                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-4 focus:ring-red-500/20 focus:border-red-500 resize-none transition-all"
                                rows={3}
                                autoFocus
                            />
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 flex gap-3 justify-end">
                        <button
                            onClick={handleCancel}
                            className="px-5 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 font-medium hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        >
                            Hủy
                        </button>
                        <button
                            onClick={handleConfirm}
                            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-bold shadow-lg shadow-red-500/30 hover:shadow-red-500/40 hover:from-red-600 hover:to-red-700 transition-all flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined text-lg">check</span>
                            Xác nhận
                        </button>
                    </div>
                </div>
            </div>

            {/* Animation styles */}
            <style>{`
        @keyframes scaleIn {
          from { 
            opacity: 0;
            transform: scale(0.9) translateY(-10px);
          }
          to { 
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
      `}</style>
        </>
    );
};

export default RejectModal;
