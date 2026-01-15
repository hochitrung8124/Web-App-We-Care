import React from 'react';
import { Lead } from '../types';

interface LeadTableProps {
  leads: Lead[];
  selectedLeadId: string | null;
  onSelectLead: (lead: Lead) => void;
  department?: 'SALE' | 'MARKETING' | 'ALL' | null;
}

const LeadTable: React.FC<LeadTableProps> = ({ leads, selectedLeadId, onSelectLead, department }) => {
  const ROWS_PER_PAGE = 5;
  const emptyRowsCount = Math.max(0, ROWS_PER_PAGE - leads.length);

  return (
    <div className="relative overflow-hidden rounded-2xl shadow-xl">
      {/* Gradient border effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-violet-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" style={{ padding: '2px' }}></div>

      <div className="relative bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse table-fixed min-h-[400px]">
            <thead>
              <tr className="bg-gradient-to-r from-slate-50 via-blue-50/50 to-violet-50/50 dark:from-slate-800/80 dark:via-blue-900/20 dark:to-violet-900/20 border-b-2 border-slate-200 dark:border-slate-700">
                <th className="px-6 py-4 text-slate-700 dark:text-slate-300 text-xs font-extrabold uppercase tracking-widest w-[25%]">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg text-blue-600 dark:text-violet-400">person</span>
                    Khách hàng
                  </div>
                </th>
                <th className="px-6 py-4 text-slate-700 dark:text-slate-300 text-xs font-extrabold uppercase tracking-widest w-[15%]">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg text-emerald-600 dark:text-emerald-400">call</span>
                    Số điện thoại
                  </div>
                </th>
                <th className="px-6 py-4 text-slate-700 dark:text-slate-300 text-xs font-extrabold uppercase tracking-widest w-[15%]">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg text-amber-600 dark:text-amber-400">campaign</span>
                    Nguồn
                  </div>
                </th>
                <th className="px-6 py-4 text-slate-700 dark:text-slate-300 text-xs font-extrabold uppercase tracking-widest w-[20%]">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg text-rose-600 dark:text-rose-400">sticky_note_2</span>
                    Ghi chú
                  </div>
                </th>
                <th className="px-6 py-4 text-slate-700 dark:text-slate-300 text-xs font-extrabold uppercase tracking-widest w-[18%]">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg text-violet-600 dark:text-violet-400">monitoring</span>
                    Trạng thái
                  </div>
                </th>
                <th className="px-6 py-4 text-slate-700 dark:text-slate-300 text-xs font-extrabold uppercase tracking-widest text-right w-[7%]">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {leads.map((lead, index) => {
                const isSelected = lead.id === selectedLeadId;
                return (
                  <tr
                    key={lead.id}
                    onClick={() => onSelectLead(lead)}
                    className={`
                  transition-all duration-300 group relative cursor-pointer
                  ${isSelected
                        ? 'bg-gradient-to-r from-blue-50 via-violet-50/50 to-blue-50 dark:from-blue-900/20 dark:via-violet-900/20 dark:to-blue-900/20 border-l-4 border-l-blue-500 dark:border-l-violet-500 shadow-lg'
                        : 'hover:bg-gradient-to-r hover:from-slate-50 hover:via-blue-50/30 hover:to-slate-50 dark:hover:from-slate-800/40 dark:hover:via-blue-900/10 dark:hover:to-slate-800/40 border-l-4 border-l-transparent hover:border-l-blue-300 dark:hover:border-l-violet-400 hover:shadow-md'}
                `}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`size-10 rounded-xl flex items-center justify-center font-bold text-sm shadow-md ${lead.avatarColorClass} ${isSelected ? 'scale-110 shadow-lg' : 'group-hover:scale-105'} transition-transform duration-300`}
                        >
                          {lead.initials}
                        </div>
                        <div>
                          <p className="text-slate-900 dark:text-white font-bold text-sm mb-0.5">
                            {lead.name}
                          </p>
                          <p className="text-slate-500 dark:text-slate-400 text-xs flex items-center gap-1 truncate max-w-[200px]">
                            <span className="material-symbols-outlined text-xs">location_on</span>
                            <span className="truncate">{lead.address || 'Chưa có địa chỉ'}</span>
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                          <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-sm">call</span>
                        </div>
                        <span className="text-slate-900 dark:text-white font-mono font-bold text-sm">
                          {lead.phone}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold border border-slate-200 dark:border-slate-700">
                        <span className="material-symbols-outlined text-sm">campaign</span>
                        {lead.source}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {(() => {
                        // Debug logging for Hihi customer
                        if (lead.name === 'Hihi') {
                          console.log('🔍 LeadTable DEBUG Hihi:', {
                            name: lead.name,
                            notes: lead.notes,
                            hasNotes: !!lead.notes,
                            notesLength: lead.notes?.length,
                            fullLead: lead
                          });
                        }
                        return (
                          <p className="text-slate-600 dark:text-slate-400 text-xs line-clamp-2">
                            {lead.notes || <span className="italic text-slate-400 dark:text-slate-500">Chưa có ghi chú</span>}
                          </p>
                        );
                      })()}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/30 text-amber-700 dark:text-amber-300 text-xs font-bold border-2 border-amber-200 dark:border-amber-800 shadow-sm">
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                        </span>
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300
                    ${isSelected 
                      ? 'bg-gradient-to-r from-blue-500 to-violet-500 dark:from-blue-600 dark:to-violet-600 text-white shadow-lg' 
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:bg-gradient-to-r group-hover:from-blue-500 group-hover:to-violet-500 dark:group-hover:from-blue-600 dark:group-hover:to-violet-600 group-hover:text-white'}
                  ">
                        <span className="material-symbols-outlined text-2xl">
                          chevron_right
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {/* Empty rows to maintain consistent table height */}
              {Array.from({ length: emptyRowsCount }).map((_, index) => (
                <tr key={`empty-${index}`} className="border-l-4 border-l-transparent">
                  <td className="px-6 py-4" style={{ height: '75px' }}>
                    <div className="h-10"></div>
                  </td>
                  <td className="px-6 py-4"></td>
                  <td className="px-6 py-4"></td>
                  <td className="px-6 py-4"></td>
                  <td className="px-6 py-4"></td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Pagination Footer */}

        </div>
      </div>
    </div>
  );
};
export default LeadTable;