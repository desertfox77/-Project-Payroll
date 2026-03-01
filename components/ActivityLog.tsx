
import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Download, 
  Calendar, 
  ChevronDown,
  ArrowRightLeft,
  Wallet,
  Clock,
  Settings,
  X,
  Info,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { MOCK_ACTIVITIES } from '../constants';
import { Activity, Language } from '../types';
import { translations } from '../translations';

interface ActivityLogProps {
  language: Language;
}

export const ActivityLog: React.FC<ActivityLogProps> = ({ language }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const t = translations[language];

  const filteredActivities = useMemo(() => {
    return MOCK_ACTIVITIES.filter(act => {
      const matchesSearch = 
        act.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        act.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (act.recipientName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        act.id.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = typeFilter === 'All' || act.type === typeFilter;

      return matchesSearch && matchesType;
    });
  }, [searchTerm, typeFilter]);

  const handleExportCSV = () => {
    const headers = ['Date', 'Activity ID', 'Type', 'Title', 'Description', 'Amount', 'Status'];
    const csvRows = filteredActivities.map(act => [
      act.date,
      act.id,
      act.type,
      act.title,
      act.description,
      act.amount?.toString() || '0',
      act.status
    ]);

    const csvContent = [
      headers.join(','),
      ...csvRows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `activity_log_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'disbursement': return <ArrowRightLeft size={18} className="text-blue-600" />;
      case 'topup': return <Wallet size={18} className="text-green-600" />;
      case 'system': return <Settings size={18} className="text-slate-500" />;
    }
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-700 border-green-200';
      case 'Failed': return 'bg-red-100 text-red-700 border-red-200';
      case 'Pending': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusLabel = (status: string) => {
    if (language === 'en') return status;
    if (status === 'Completed') return 'Selesai';
    if (status === 'Failed') return 'Gagal';
    return 'Menunggu';
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{t.act_title}</h1>
          <p className="text-slate-500 mt-1">{t.act_subtitle}</p>
        </div>
        <button 
          onClick={handleExportCSV}
          className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-lg font-semibold hover:bg-slate-50 transition-all shadow-sm"
        >
          <Download size={18} />
          {t.hist_export}
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm md:flex md:items-center md:gap-4 relative z-10">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder={language === 'en' ? 'Search activities...' : 'Cari aktivitas...'}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="relative">
          <select 
            className="appearance-none bg-slate-50 border border-slate-200 rounded-lg pl-4 pr-10 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="All">{t.act_types_all}</option>
            <option value="disbursement">{t.act_types_disb}</option>
            <option value="topup">{t.act_types_topup}</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">{t.tbl_date}</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">{t.tbl_activity}</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">{t.tbl_amount}</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">{t.tbl_status}</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-center">{t.tbl_action}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredActivities.length > 0 ? filteredActivities.map((act) => (
                <tr key={act.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-slate-600">{act.date}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                        {getActivityIcon(act.type)}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-slate-900">{act.title}</span>
                        <span className="text-xs text-slate-500 truncate max-w-xs">{act.description}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-900 font-bold text-right">
                    {act.amount ? `Rp ${act.amount.toLocaleString()}` : '-'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusStyles(act.status)}`}>
                      {getStatusLabel(act.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button 
                      onClick={() => setSelectedActivity(act)}
                      className="text-blue-600 hover:text-blue-800 font-bold text-sm hover:underline"
                    >
                      {language === 'en' ? 'Details' : 'Rincian'}
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    {language === 'en' ? 'No activities found matching your criteria.' : 'Tidak ada aktivitas yang cocok dengan kriteria Anda.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedActivity && (
        <div 
          className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-slate-900/40 backdrop-blur-[2px] animate-fadeIn overflow-y-auto pt-10 md:pt-24"
          onClick={() => setSelectedActivity(null)}
        >
          <div 
            className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-zoomIn mb-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white">
              <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div>
                  <h3 className="text-lg font-black text-slate-900">{selectedActivity.title}</h3>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                    {selectedActivity.type === 'topup' 
                      ? (language === 'en' ? 'Transaction Code: ' : 'Kode Transaksi: ') 
                      : 'ID: '}
                    {selectedActivity.id}
                  </p>
                </div>
                <button onClick={() => setSelectedActivity(null)} className="p-2 hover:bg-slate-100 rounded-full"><X size={20} /></button>
              </div>
              <div className="p-8 space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between text-sm py-2 border-b border-slate-100">
                    <span className="text-slate-500">{language === 'en' ? 'Date' : 'Tanggal'}</span>
                    <span className="text-slate-900 font-bold">{selectedActivity.date}</span>
                  </div>
                  <div className="flex justify-between text-sm py-2 border-b border-slate-100">
                    <span className="text-slate-500">{language === 'en' ? 'Type' : 'Tipe'}</span>
                    <span className="text-slate-900 font-bold uppercase">{selectedActivity.type}</span>
                  </div>
                  <div className="flex justify-between text-sm py-2 border-b border-slate-100">
                    <span className="text-slate-500">Status</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${getStatusStyles(selectedActivity.status)}`}>
                      {getStatusLabel(selectedActivity.status)}
                    </span>
                  </div>
                  {selectedActivity.amount && (
                    <div className="flex justify-between text-sm py-2 border-b border-slate-100">
                      <span className="text-slate-500">{language === 'en' ? 'Amount' : 'Jumlah'}</span>
                      <span className="text-blue-600 font-black">Rp {selectedActivity.amount.toLocaleString()}</span>
                    </div>
                  )}
                  {selectedActivity.recipientName && (
                    <div className="flex justify-between text-sm py-2 border-b border-slate-100">
                      <span className="text-slate-500">{language === 'en' ? 'Recipient' : 'Penerima'}</span>
                      <div className="text-right">
                        <p className="text-slate-900 font-bold">{selectedActivity.recipientName}</p>
                        {selectedActivity.bankName && (
                          <p className="text-xs text-blue-600 font-bold uppercase">{selectedActivity.bankName}</p>
                        )}
                        <p className="text-xs text-slate-500 font-mono">{selectedActivity.recipient}</p>
                      </div>
                    </div>
                  )}
                  {selectedActivity.type !== 'topup' && (
                    <div className="py-2">
                      <span className="text-slate-500 text-xs font-bold uppercase block mb-1">{language === 'en' ? 'Description' : 'Keterangan'}</span>
                      <p className="text-sm text-slate-700 italic">"{selectedActivity.description}"</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
