
import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  FileText, 
  Users, 
  Trash2, 
  AlertCircle,
  CheckCircle2,
  XCircle,
  Search
} from 'lucide-react';
import { ScheduledBatch, Language } from '../types';
import { MOCK_SCHEDULED_BATCHES } from '../constants';
import { translations } from '../translations';

interface ScheduledDisbursementsProps {
  language: Language;
}

export const ScheduledDisbursements: React.FC<ScheduledDisbursementsProps> = ({ language }) => {
  const [batches, setBatches] = useState<ScheduledBatch[]>(MOCK_SCHEDULED_BATCHES);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCancelModal, setShowCancelModal] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const t = translations[language];

  const filteredBatches = batches.filter(batch => 
    batch.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    batch.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCancel = (id: string) => {
    setBatches(batches.map(b => b.id === id ? { ...b, status: 'cancelled' } : b));
    setShowCancelModal(null);
    setSuccessMessage(t.sched_cancel_success);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{t.sched_title}</h1>
          <p className="text-slate-500 mt-1">{t.sched_subtitle}</p>
        </div>
      </div>

      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-2xl flex items-center gap-3 animate-fadeIn">
          <CheckCircle2 size={20} />
          <p className="font-bold text-sm">{successMessage}</p>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm relative z-10">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder={language === 'en' ? 'Search by file name or ID...' : 'Cari berdasarkan nama file atau ID...'}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">{t.sched_tbl_file}</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">{t.sched_tbl_recipients}</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">{t.tbl_amount}</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">{t.sched_tbl_time}</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">{t.tbl_status}</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-center">{t.tbl_action}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBatches.length > 0 ? filteredBatches.map((batch) => (
                <tr key={batch.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                        <FileText size={18} className="text-blue-600" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-slate-900">{batch.fileName}</span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{batch.id}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Users size={14} />
                      <span className="text-sm font-bold">{batch.totalRecipients}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-900 font-bold text-right">
                    Rp {batch.totalAmount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5 text-slate-900 font-bold text-sm">
                        <Calendar size={14} className="text-slate-400" />
                        {batch.scheduledTime.split(' ')[0]}
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
                        <Clock size={14} className="text-slate-400" />
                        {batch.scheduledTime.split(' ')[1]}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${
                      batch.status === 'scheduled' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                      batch.status === 'cancelled' ? 'bg-red-50 text-red-700 border-red-200' :
                      batch.status === 'processing' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      'bg-green-50 text-green-700 border-green-200'
                    }`}>
                      {batch.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {batch.status === 'scheduled' && (
                      <button 
                        onClick={() => setShowCancelModal(batch.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title={t.sched_cancel_btn}
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    {t.sched_no_data}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showCancelModal && (
        <div 
          className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-slate-900/40 backdrop-blur-[2px] animate-fadeIn overflow-y-auto pt-10 md:pt-24"
          onClick={() => setShowCancelModal(null)}
        >
          <div 
            className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-zoomIn mb-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8 text-center space-y-6">
              <div className="w-20 h-20 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle size={40} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black text-slate-900">{t.sched_cancel_btn}</h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">
                  {t.sched_cancel_confirm}
                </p>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={() => setShowCancelModal(null)}
                  className="flex-1 py-4 border border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition-all"
                >
                  {t.man_btn_cancel}
                </button>
                <button 
                  onClick={() => handleCancel(showCancelModal)}
                  className="flex-1 py-4 bg-red-600 text-white font-bold rounded-2xl hover:bg-red-700 shadow-lg shadow-red-200 transition-all"
                >
                  {language === 'en' ? 'Confirm Cancel' : 'Konfirmasi Batal'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
