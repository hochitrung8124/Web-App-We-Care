import React from 'react';
import { Lead } from '../types';

interface LeadTableProps {
  leads: Lead[];
  selectedLeadId: string | null;
  onSelectLead: (lead: Lead) => void;
}

const LeadTable: React.FC<LeadTableProps> = ({ leads, selectedLeadId, onSelectLead }) => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
            <th className="px-4 py-4 text-slate-600 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
              Khách hàng
            </th>
            <th className="px-4 py-4 text-slate-600 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
              Số điện thoại
            </th>
            <th className="px-4 py-4 text-slate-600 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
              Nguồn
            </th>
            <th className="px-4 py-4 text-slate-600 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
              Trạng thái
            </th>
            <th className="px-4 py-4 text-slate-600 dark:text-slate-400 text-xs font-bold uppercase tracking-wider text-right">
              Thao tác
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {leads.map((lead) => {
            const isSelected = lead.id === selectedLeadId;
            return (
              <tr
                key={lead.id}
                onClick={() => onSelectLead(lead)}
                className={`
                  transition-colors cursor-pointer group
                  ${isSelected 
                    ? 'bg-primary/5 border-l-4 border-l-primary' 
                    : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/30 border-l-4 border-l-transparent'}
                `}
              >
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`size-9 rounded-full flex items-center justify-center font-bold text-sm ${lead.avatarColorClass}`}
                    >
                      {lead.initials}
                    </div>
                    <div>
                      <p className="text-slate-900 dark:text-white font-semibold text-sm">
                        {lead.name}
                      </p>
                      <p className="text-slate-400 text-[10px] italic">
                        {lead.subInfo}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <span className="text-slate-900 dark:text-white font-mono font-bold text-sm">
                    {lead.phone}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <span className="text-slate-700 dark:text-slate-300 text-sm">
                    {lead.source}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-[10px] font-bold border border-amber-100 dark:border-amber-900/30">
                    <span className="size-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                    {lead.status}
                  </span>
                </td>
                <td className="px-4 py-4 text-right">
                  <span
                    className={`material-symbols-outlined text-2xl transition-colors ${
                      isSelected ? 'text-primary' : 'text-slate-300 group-hover:text-primary'
                    }`}
                  >
                    chevron_right
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {/* Pagination Footer */}
      <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex justify-between items-center">
        <p className="text-slate-500 text-xs">Trang 1 / 5</p>
        <div className="flex gap-2">
          <button
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-400 disabled:opacity-50 hover:bg-slate-50"
            disabled
          >
            <span className="material-symbols-outlined text-sm">chevron_left</span>
          </button>
          <button className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50">
            <span className="material-symbols-outlined text-sm">chevron_right</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeadTable;