import React from 'react';
import { Lead } from '../types';

interface LeadTableProps {
  leads: Lead[];
  selectedLeadId: string | null;
  onSelectLead: (lead: Lead) => void;
}

const LeadTable: React.FC<LeadTableProps> = ({ leads, selectedLeadId, onSelectLead }) => {
  const ROWS_PER_PAGE = 5;
  const emptyRowsCount = Math.max(0, ROWS_PER_PAGE - leads.length);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse table-fixed min-h-[440px]">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
            <th className="px-4 py-4 text-slate-600 dark:text-slate-400 text-xs font-bold uppercase tracking-wider w-[35%]">
              Khách hàng
            </th>
            <th className="px-4 py-4 text-slate-600 dark:text-slate-400 text-xs font-bold uppercase tracking-wider w-[20%]">
              Số điện thoại
            </th>
            <th className="px-4 py-4 text-slate-600 dark:text-slate-400 text-xs font-bold uppercase tracking-wider w-[20%]">
              Nguồn
            </th>
            <th className="px-4 py-4 text-slate-600 dark:text-slate-400 text-xs font-bold uppercase tracking-wider w-[18%]">
              Trạng thái
            </th>
            <th className="px-4 py-4 text-slate-600 dark:text-slate-400 text-xs font-bold uppercase tracking-wider text-right w-[7%]">
              Thao tác
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
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
          
          {/* Empty rows to maintain consistent table height */}
          {Array.from({ length: emptyRowsCount }).map((_, index) => (
            <tr key={`empty-${index}`} className="border-l-4 border-l-transparent">
              <td className="px-4 py-4" style={{ height: '73px' }}>
                <div className="h-9"></div>
              </td>
              <td className="px-4 py-4"></td>
              <td className="px-4 py-4"></td>
              <td className="px-4 py-4"></td>
              <td className="px-4 py-4"></td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Pagination Footer */}
    
    </div>
    </div>
  );
};

export default LeadTable;