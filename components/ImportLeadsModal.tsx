import React, { useState, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { Lead } from '../types';
import { parseExcelFile, createExcelTemplate, ImportResult } from '../services/ExcelImportService';

interface ImportLeadsModalProps {
  onClose: () => void;
  onImport: (leads: Partial<Lead>[]) => Promise<void>;
  importing?: boolean;
}

const ImportLeadsModal: React.FC<ImportLeadsModalProps> = ({ onClose, onImport, importing = false }) => {
  const [file, setFile] = useState<File | null>(null);
  const [parseResult, setParseResult] = useState<ImportResult | null>(null);
  const [parsing, setParsing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Check file type
    const validTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];
    
    if (!validTypes.includes(selectedFile.type) && !selectedFile.name.match(/\.(xlsx|xls)$/)) {
      alert('Vui lòng chọn file Excel (.xlsx hoặc .xls)');
      return;
    }

    setFile(selectedFile);
    setParsing(true);
    setParseResult(null);

    try {
      const result = await parseExcelFile(selectedFile);
      setParseResult(result);
    } catch (error) {
      console.error('Error parsing Excel:', error);
      alert('Lỗi đọc file Excel. Vui lòng kiểm tra định dạng file.');
    } finally {
      setParsing(false);
    }
  };

  const handleImport = async () => {
    if (!parseResult || parseResult.leads.length === 0) return;
    await onImport(parseResult.leads);
  };

  const handleDownloadTemplate = async () => {
    try {
      await createExcelTemplate();
      toast.success('Đã tải xuống file mẫu!', {
        duration: 3000,
        icon: '📥',
      });
    } catch (error) {
      console.error('Error creating template:', error);
      toast.error('Lỗi tạo file mẫu', {
        duration: 3000,
        icon: '❌',
      });
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-gradient-to-br from-black/60 via-slate-900/50 to-black/60 backdrop-blur-md z-40 animate-fade-in"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div 
          className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-hidden pointer-events-auto animate-slide-up border border-slate-200/50 dark:border-slate-700/50"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative overflow-hidden px-6 py-6 bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnptLTEyIDEyYzMuMzE0IDAgNiAyLjY4NiA2IDZzLTIuNjg2IDYtNiA2LTYtMi42ODYtNi02IDIuNjg2LTYgNi02eiIgZmlsbD0iI2ZmZiIgb3BhY2l0eT0iLjA1Ii8+PC9nPjwvc3ZnPg==')] opacity-30"></div>
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-xl flex items-center justify-center ring-4 ring-white/30">
                  <span className="material-symbols-outlined text-white text-2xl">upload_file</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">Import Khách Hàng</h2>
                  <p className="text-sm text-white/80">Tải lên file Excel để nhập hàng loạt</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/10 hover:bg-white/20 backdrop-blur-xl transition-all hover:scale-110"
                disabled={importing}
              >
                <span className="material-symbols-outlined text-white">close</span>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-6 overflow-y-auto max-h-[calc(85vh-180px)]">
            {/* Download Template */}
            <div className="mb-5 p-4 bg-gradient-to-r from-blue-50 to-violet-50 dark:from-blue-900/20 dark:to-violet-900/20 rounded-xl border-2 border-blue-200/60 dark:border-blue-800/60">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5 flex-1">
                  <div className="w-9 h-9 rounded-lg bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-lg">download</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-blue-900 dark:text-blue-300 mb-1">Chưa có file Excel?</p>
                    <p className="text-xs text-blue-700 dark:text-blue-400">
                      Tải xuống file mẫu để xem định dạng chuẩn
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleDownloadTemplate}
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-all hover:scale-105 flex items-center gap-1.5 whitespace-nowrap"
                >
                  <span className="material-symbols-outlined text-base">download</span>
                  Tải mẫu
                </button>
              </div>
            </div>

            {/* File Upload */}
            <div className="mb-5">
              <label className="block text-sm font-bold text-slate-900 dark:text-white mb-2">
                Chọn file Excel
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileSelect}
                className="hidden"
                disabled={importing}
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-6 text-center cursor-pointer hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 transition-all"
              >
                {file ? (
                  <div className="flex items-center justify-center gap-2.5">
                    <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-3xl">description</span>
                    <div className="text-left">
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{file.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{(file.size / 1024).toFixed(2)} KB</p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <span className="material-symbols-outlined text-slate-400 text-4xl mb-2 block">cloud_upload</span>
                    <p className="text-sm font-bold text-slate-900 dark:text-white mb-1">Nhấn để chọn file Excel</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Hỗ trợ .xlsx và .xls</p>
                  </div>
                )}
              </div>
            </div>

            {/* Parsing Status */}
            {parsing && (
              <div className="mb-5 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center gap-2.5">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm font-medium text-blue-900 dark:text-blue-300">Đang đọc file...</p>
              </div>
            )}

            {/* Parse Result */}
            {parseResult && (
              <div className="mb-5 space-y-3">
                {/* Success Summary */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-lg">check_circle</span>
                      <p className="text-xs font-bold text-green-900 dark:text-green-300">Hợp lệ</p>
                    </div>
                    <p className="text-xl font-bold text-green-600 dark:text-green-400">{parseResult.success}</p>
                  </div>
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="material-symbols-outlined text-red-600 dark:text-red-400 text-lg">error</span>
                      <p className="text-xs font-bold text-red-900 dark:text-red-300">Lỗi</p>
                    </div>
                    <p className="text-xl font-bold text-red-600 dark:text-red-400">{parseResult.failed}</p>
                  </div>
                </div>

                {/* Errors */}
                {parseResult.errors.length > 0 && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800 max-h-40 overflow-y-auto">
                    <p className="text-xs font-bold text-red-900 dark:text-red-300 mb-2">Chi tiết lỗi:</p>
                    <ul className="space-y-1.5">
                      {parseResult.errors.map((err, idx) => (
                        <li key={idx} className="text-xs text-red-700 dark:text-red-400">
                          <span className="font-bold">Dòng {err.row}:</span> {err.error}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-2 border-t-2 border-slate-200 dark:border-slate-800 bg-gradient-to-r from-slate-50 via-white to-slate-50 dark:from-slate-800/50 dark:via-slate-900/50 dark:to-slate-800/50">
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-base">info</span>
              Trạng thái mặc định: Marketing đã xác nhận
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 rounded-xl border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-700 hover:scale-105 transition-all duration-200"
                disabled={importing}
              >
                Hủy
              </button>
              <button
                onClick={handleImport}
                disabled={!parseResult || parseResult.leads.length === 0 || importing}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 text-white font-bold shadow-xl shadow-emerald-500/30 hover:shadow-2xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2"
              >
                {importing ? (
                  <>
                    <span className="material-symbols-outlined text-lg animate-spin">sync</span>
                    <span>Đang import...</span>
                  </>
                ) : (
                  <>
                    <span>Import</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ImportLeadsModal;
