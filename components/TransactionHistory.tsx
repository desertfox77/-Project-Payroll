
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  Calendar, 
  ChevronDown,
  ArrowUpDown,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Clock,
  Check,
  X,
  User as UserIcon,
  Copy,
  Printer,
  FileText,
  ChevronRight,
  Loader2,
  Share2
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { Language } from '../types';
import { translations } from '../translations';
import { reportIssueToGoogleChat } from '../services/reportService';
import { MOCK_AGENT } from '../constants';

// Helper to get relative dates for better filter demonstration
const now = new Date();
const getOffsetDate = (days: number, hours: number = 0) => {
  const d = new Date(now);
  d.setDate(d.getDate() - days);
  d.setHours(d.getHours() - hours);
  return d.toISOString().replace('T', ' ').substring(0, 16);
};

interface HistoryTransaction {
  id: string;
  date: string;
  recipient: string;
  amount: number;
  status: string;
  fee?: number;
  description?: string;
  recipientName?: string;
  bankName?: string;
}

interface TransactionHistoryProps {
  language: Language;
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({ language }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateRange, setDateRange] = useState('All Time');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState<HistoryTransaction | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportDescription, setReportDescription] = useState('');
  const [isReporting, setIsReporting] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);
  const datePickerRef = useRef<HTMLDivElement>(null);
  const receiptRef = useRef<HTMLDivElement>(null);
  const t = translations[language];

  const dateOptions = [
    { label: t.common_all_time, val: 'All Time' },
    { label: t.common_today, val: 'Today' },
    { label: t.common_week, val: 'This Week' },
    { label: t.common_month, val: 'This Month' },
    { label: t.common_last_30, val: 'Last 30 Days' },
    { label: t.common_custom, val: 'Custom Range' },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setIsDatePickerOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const allTransactions = useMemo<HistoryTransaction[]>(() => [
    { id: 'TX-11', date: getOffsetDate(0, 0), recipient: '0661180128', recipientName: 'Leonardus Wiliem /A', bankName: 'Bank Central Asia (BCA)', amount: 2500000, status: 'Completed', fee: 10000, description: 'BCA Bank Transfer' },
    { id: 'TX-1', date: getOffsetDate(0, 1), recipient: '081519866374', recipientName: 'Soekarno', amount: 1500000, status: 'Completed', fee: 0, description: 'October Salary' },
    { id: 'TX-2', date: getOffsetDate(0, 5), recipient: '081812341230', recipientName: 'Suharto', amount: 200000, status: 'Completed', fee: 0, description: 'Transport Allowance' },
    { id: 'TX-3', date: getOffsetDate(1, 2), recipient: '081234567890', recipientName: 'Bacharuddin', amount: 5000000, status: 'Failed', fee: 0, description: 'Bonus Payment' },
    { id: 'TX-4', date: getOffsetDate(3, 10), recipient: '081122334457', recipientName: 'Megawati', amount: 1200000, status: 'Completed', fee: 0, description: 'Incentives' },
    { id: 'TX-5', date: getOffsetDate(5, 4), recipient: '081519866374', recipientName: 'Soekarno', amount: 450000, status: 'Completed', fee: 0, description: 'Overtime Pay' },
    { id: 'TX-6', date: getOffsetDate(10, 2), recipient: '085566778898', recipientName: 'Susilo', amount: 3000000, status: 'Completed', fee: 0, description: 'Monthly Retainer' },
    { id: 'TX-7', date: getOffsetDate(15, 0), recipient: '081234567890', recipientName: 'Bacharuddin', amount: 150000, status: 'Completed', fee: 0, description: 'Refund' },
    { id: 'TX-8', date: getOffsetDate(20, 8), recipient: '089765432134', recipientName: 'Abdurrahman', amount: 2500000, status: 'Failed', fee: 0, description: 'Project Fee' },
    { id: 'TX-9', date: getOffsetDate(35, 1), recipient: '081812341230', recipientName: 'Suharto', amount: 1200000, status: 'Completed', fee: 0, description: 'September Bonus' },
    { id: 'TX-10', date: getOffsetDate(60, 5), recipient: '081122334457', recipientName: 'Megawati', amount: 800000, status: 'Completed', fee: 0, description: 'Commission' },
  ], []);

  const filteredTransactions = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const last30Days = new Date(today);
    last30Days.setDate(today.getDate() - 30);

    return allTransactions.filter(tx => {
      const matchesSearch = 
        tx.recipient.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (tx.recipientName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        tx.id.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'All' || tx.status === statusFilter;

      const txDate = new Date(tx.date);
      let matchesDate = true;

      if (dateRange === 'Today') {
        matchesDate = txDate >= today;
      } else if (dateRange === 'This Week') {
        matchesDate = txDate >= startOfWeek;
      } else if (dateRange === 'This Month') {
        matchesDate = txDate >= startOfMonth;
      } else if (dateRange === 'Last 30 Days') {
        matchesDate = txDate >= last30Days;
      } else if (dateRange === 'Custom Range') {
        if (customStartDate) {
          const start = new Date(customStartDate);
          start.setHours(0, 0, 0, 0);
          matchesDate = matchesDate && txDate >= start;
        }
        if (customEndDate) {
          const end = new Date(customEndDate);
          end.setHours(23, 59, 59, 999);
          matchesDate = matchesDate && txDate <= end;
        }
      }

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [allTransactions, searchTerm, statusFilter, dateRange, customStartDate, customEndDate]);

  const handleExportCSV = () => {
    const headers = ['Date', 'Transaction ID', 'Recipient Name', 'Phone', 'Amount', 'Status', 'Description'];
    const csvRows = filteredTransactions.map(tx => [
      tx.date,
      tx.id,
      tx.recipientName || tx.recipient,
      tx.recipient,
      tx.amount.toString(),
      tx.status,
      tx.description || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...csvRows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `paystream_transactions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadPDF = (tx: HistoryTransaction) => {
    const doc = new jsPDF();
    doc.setFillColor(30, 41, 59);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.text('PAYSTREAM', 20, 25);
    doc.setFontSize(10);
    doc.text(language === 'en' ? 'OFFICIAL TRANSACTION RECEIPT' : 'RESI TRANSAKSI RESMI', 20, 32);
    
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(12);
    doc.text(`${language === 'en' ? 'Receipt ID' : 'ID Resi'}: ${tx.id}`, 20, 55);
    doc.text(`${language === 'en' ? 'Date' : 'Tanggal'}: ${tx.date}`, 140, 55);
    
    doc.setDrawColor(226, 232, 240);
    doc.line(20, 65, 190, 65);
    
    doc.setFontSize(14);
    doc.text(language === 'en' ? 'RECIPIENT DETAILS' : 'RINCIAN PENERIMA', 20, 75);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`${language === 'en' ? 'Name' : 'Nama'}: ${tx.recipientName || tx.recipient}`, 25, 85);
    doc.text(`${language === 'en' ? 'Phone' : 'Telepon'}: ${tx.recipient}`, 25, 92);
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(language === 'en' ? 'PAYMENT SUMMARY' : 'RINGKASAN PEMBAYARAN', 20, 110);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text(language === 'en' ? 'Item' : 'Item', 25, 120);
    doc.text(language === 'en' ? 'Amount' : 'Jumlah', 150, 120);
    doc.line(25, 122, 185, 122);
    
    doc.text(language === 'en' ? 'Disbursement Amount' : 'Jumlah Penyaluran', 25, 130);
    doc.text(`Rp ${tx.amount.toLocaleString()}`, 150, 130);
    
    doc.text(language === 'en' ? 'Service Fee' : 'Biaya Layanan', 25, 138);
    doc.text(`Rp ${(tx.fee || 0).toLocaleString()}`, 150, 138);
    
    doc.line(25, 155, 185, 155);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text(language === 'en' ? 'Total Deduction' : 'Total Potongan', 25, 165);
    doc.setTextColor(37, 99, 235);
    doc.text(`Rp ${(tx.amount + (tx.fee || 0)).toLocaleString()}`, 150, 165);
    
    doc.save(`PayStream_Receipt_${tx.id}.pdf`);
  };

  const handleReportIssue = (txId: string) => {
    setIsReportModalOpen(true);
    setReportDescription('');
    setReportSuccess(false);
  };

  const handleSubmitReport = async () => {
    if (reportDescription.length < 10 || !selectedTx) return;
    
    setIsReporting(true);
    try {
      await reportIssueToGoogleChat(selectedTx.id, reportDescription, MOCK_AGENT.name);
      setReportSuccess(true);
      setTimeout(() => {
        setIsReportModalOpen(false);
        setReportSuccess(false);
        setSelectedTx(null);
      }, 2500);
    } catch (error) {
      alert(language === 'en' ? 'Failed to send report' : 'Gagal mengirim laporan');
    } finally {
      setIsReporting(false);
    }
  };

  const handleShare = async (tx: HistoryTransaction) => {
    const shareText = language === 'en' 
      ? `Transaction Receipt\nID: ${tx.id}\nRecipient: ${tx.recipientName}\nAmount: Rp ${tx.amount.toLocaleString()}\nDate: ${tx.date}`
      : `Resi Transaksi\nID: ${tx.id}\nPenerima: ${tx.recipientName}\nJumlah: Rp ${tx.amount.toLocaleString()}\nTanggal: ${tx.date}`;

    if (receiptRef.current) {
      try {
        const canvas = await html2canvas(receiptRef.current, {
          scale: 2,
          backgroundColor: '#ffffff',
          logging: false,
          useCORS: true
        });
        
        const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
        
        if (blob && navigator.share && navigator.canShare) {
          const file = new File([blob], `Receipt_${tx.id}.png`, { type: 'image/png' });
          
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: language === 'en' ? 'Transaction Receipt' : 'Resi Transaksi',
              text: shareText,
            });
            return;
          }
        }
      } catch (err) {
        console.error('Error generating or sharing image:', err);
      }
    }

    // Fallback to text sharing if image sharing fails or is not supported
    if (navigator.share) {
      try {
        await navigator.share({
          title: language === 'en' ? 'Transaction Receipt' : 'Resi Transaksi',
          text: shareText,
          url: window.location.origin
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Error sharing text:', err);
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareText);
        alert(language === 'en' ? 'Transaction details copied to clipboard!' : 'Detail transaksi disalin ke papan klip!');
      } catch (err) {
        console.error('Error copying:', err);
      }
    }
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-700 border-green-200';
      case 'Failed': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed': return <CheckCircle2 size={14} className="mr-1.5" />;
      case 'Failed': return <XCircle size={14} className="mr-1.5" />;
      default: return <Clock size={14} className="mr-1.5" />;
    }
  };

  const clearCustomDates = () => {
    setCustomStartDate('');
    setCustomEndDate('');
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
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{t.hist_title}</h1>
          <p className="text-slate-500 mt-1">{t.hist_subtitle}</p>
        </div>
        <button 
          onClick={handleExportCSV}
          className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-lg font-semibold hover:bg-slate-50 transition-all shadow-sm"
        >
          <Download size={18} />
          {t.hist_export}
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-4 md:space-y-0 md:flex md:items-center md:gap-4 relative z-10">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder={t.hist_search_placeholder}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            <select 
              className="appearance-none bg-slate-50 border border-slate-200 rounded-lg pl-4 pr-10 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer text-slate-700"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">{t.hist_filter_status}</option>
              <option value="Completed">{language === 'en' ? 'Completed' : 'Selesai'}</option>
              <option value="Failed">{language === 'en' ? 'Failed' : 'Gagal'}</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
          </div>

          <div className="relative" ref={datePickerRef}>
            <button 
              onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
              className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium transition-all ${
                isDatePickerOpen 
                  ? 'bg-blue-50 border-blue-200 text-blue-700' 
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Calendar size={16} />
              <span>{dateOptions.find(o => o.val === dateRange)?.label || dateRange}</span>
              <ChevronDown className={`transition-transform duration-200 ${isDatePickerOpen ? 'rotate-180' : ''}`} size={16} />
            </button>

            {isDatePickerOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden animate-fadeInUp">
                <div className="py-2 border-b border-slate-100">
                  {dateOptions.map((option) => (
                    <button
                      key={option.val}
                      onClick={() => {
                        setDateRange(option.val);
                        if (option.val !== 'Custom Range') {
                          setIsDatePickerOpen(false);
                          clearCustomDates();
                        }
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between hover:bg-slate-50 transition-colors ${
                        dateRange === option.val ? 'text-blue-600 font-bold bg-blue-50/50' : 'text-slate-700'
                      }`}
                    >
                      {option.label}
                      {dateRange === option.val && <Check size={16} />}
                    </button>
                  ))}
                </div>
                
                {dateRange === 'Custom Range' && (
                  <div className="p-4 space-y-3 bg-slate-50">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">{language === 'en' ? 'Start Date' : 'Tanggal Mulai'}</label>
                      <input 
                        type="date"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500"
                        value={customStartDate}
                        onChange={(e) => setCustomStartDate(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">{language === 'en' ? 'End Date' : 'Tanggal Selesai'}</label>
                      <input 
                        type="date"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500"
                        value={customEndDate}
                        onChange={(e) => setCustomEndDate(e.target.value)}
                      />
                    </div>
                    <button 
                      onClick={() => { setIsDatePickerOpen(false); }}
                      className="w-full mt-2 px-3 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700"
                    >
                      {language === 'en' ? 'Apply Filter' : 'Terapkan Filter'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{t.tbl_date}</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{t.tbl_tx_id}</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{t.tbl_recipient}</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">{t.tbl_amount}</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{t.tbl_status}</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">{t.tbl_action}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.length > 0 ? filteredTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-slate-600">{tx.date}</td>
                  <td className="px-6 py-4 text-sm font-mono text-slate-500">{tx.id}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-slate-900">{tx.recipientName || tx.recipient}</span>
                      <span className="text-xs text-slate-500 font-mono">{tx.recipient}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-900 font-bold text-right">Rp {tx.amount.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusStyles(tx.status)}`}>
                      {getStatusIcon(tx.status)}
                      {getStatusLabel(tx.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button 
                      onClick={() => setSelectedTx(tx)}
                      className="text-blue-600 hover:text-blue-800 font-bold text-sm hover:underline"
                    >
                      {t.hist_view_details}
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <Search size={48} className="mb-4 opacity-20" />
                      <p className="text-lg font-medium">{t.hist_no_tx}</p>
                      <button 
                        onClick={() => { setSearchTerm(''); setStatusFilter('All'); setDateRange('All Time'); clearCustomDates(); }}
                        className="mt-4 text-blue-600 font-bold hover:underline"
                      >
                        {t.hist_reset_filters}
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <p className="text-xs text-slate-500 font-medium">
            {t.hist_showing} <span className="text-slate-900 font-bold">{filteredTransactions.length}</span> {t.hist_of} <span className="text-slate-900 font-bold">{allTransactions.length}</span> {t.hist_transactions}
          </p>
        </div>
      </div>

      {selectedTx && (
        <div 
          className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-slate-900/40 backdrop-blur-[2px] animate-fadeIn overflow-y-auto pt-10 md:pt-24"
          onClick={() => setSelectedTx(null)}
        >
          <div 
            className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-zoomIn mb-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div ref={receiptRef} className="bg-white">
              <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl border ${getStatusStyles(selectedTx.status)}`}>
                     {selectedTx.status === 'Completed' ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900">{t.hist_details_title}</h3>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                      {language === 'en' ? 'Transaction Code: ' : 'Kode Transaksi: '}
                      {selectedTx.id}
                    </p>
                  </div>
                </div>
                <button onClick={() => setSelectedTx(null)} data-html2canvas-ignore className="p-2 hover:bg-slate-100 rounded-full share-exclude"><X size={20} /></button>
              </div>

              <div className="p-8 space-y-8">
                <div className="text-center space-y-2">
                  <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">{t.hist_total_disb}</p>
                  <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Rp {selectedTx.amount.toLocaleString()}</h2>
                  <div className="inline-flex items-center px-3 py-1 bg-slate-100 rounded-full text-xs font-bold text-slate-600 mt-2">
                    <Calendar size={12} className="mr-1.5" />
                    {selectedTx.date}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">{t.hist_rec_info}</h4>
                    <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-blue-600">
                        <UserIcon size={24} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-black text-slate-900">{selectedTx.recipientName || selectedTx.recipient}</p>
                        {selectedTx.bankName && (
                          <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">{selectedTx.bankName}</p>
                        )}
                        <p className="text-sm text-slate-500 font-medium font-mono">{selectedTx.recipient}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">{t.hist_breakdown}</h4>
                    <div className="space-y-3 px-1">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500 font-medium">{language === 'en' ? 'Disbursement Amount' : 'Jumlah Penyaluran'}</span>
                        <span className="text-slate-900 font-bold">Rp {selectedTx.amount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500 font-medium">{language === 'en' ? 'Service Fee' : 'Biaya Layanan'}</span>
                        <span className="text-slate-900 font-bold">Rp {(selectedTx.fee || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center pt-3 border-t-2 border-slate-100 mt-2">
                        <span className="text-slate-900 font-black">{language === 'en' ? 'Total Deduction' : 'Total Potongan'}</span>
                        <span className="text-blue-600 text-lg font-black">Rp {(selectedTx.amount + (selectedTx.fee || 0)).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 pt-0">
              <div className="flex gap-4 pt-4">
                <button 
                  onClick={() => handleDownloadPDF(selectedTx)}
                  className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-black transition-all flex items-center justify-center gap-2"
                >
                  <Printer size={18} />
                  {t.hist_print_btn}
                </button>
                <button 
                  onClick={() => handleShare(selectedTx)}
                  className="px-6 py-4 border-2 border-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-50 transition-all flex items-center gap-2"
                >
                  <Share2 size={18} />
                  {t.hist_share_btn}
                </button>
                <button 
                  onClick={() => handleReportIssue(selectedTx.id)}
                  className="px-6 py-4 border-2 border-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-50 transition-all flex items-center gap-2"
                >
                  <FileText size={18} />
                  {t.hist_report_btn}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isReportModalOpen && selectedTx && (
        <div 
          className="fixed inset-0 z-[60] flex items-start justify-center p-4 bg-slate-900/40 backdrop-blur-[2px] animate-fadeIn overflow-y-auto pt-10 md:pt-24"
          onClick={() => setIsReportModalOpen(false)}
        >
          <div 
            className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-zoomIn mb-10"
            onClick={(e) => e.stopPropagation()}
          >
            {reportSuccess ? (
              <div className="p-12 text-center space-y-4">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                  <CheckCircle2 size={40} />
                </div>
                <h3 className="text-2xl font-black text-slate-900">{t.report_success_title}</h3>
                <p className="text-slate-500 font-medium">{t.report_success_msg}</p>
              </div>
            ) : (
              <>
                <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                  <div>
                    <h3 className="text-lg font-black text-slate-900">{t.report_modal_title}</h3>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">TX ID: {selectedTx.id}</p>
                  </div>
                  <button 
                    onClick={() => setIsReportModalOpen(false)} 
                    disabled={isReporting}
                    className="p-2 hover:bg-slate-200 rounded-full transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
                
                <div className="p-8 space-y-6">
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {t.report_modal_desc}
                  </p>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
                      {t.report_label_desc}
                    </label>
                    <textarea
                      className="w-full h-32 px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all resize-none"
                      placeholder={t.report_placeholder_desc}
                      value={reportDescription}
                      onChange={(e) => setReportDescription(e.target.value)}
                      disabled={isReporting}
                    />
                    {reportDescription.length > 0 && reportDescription.length < 10 && (
                      <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider">
                        {t.report_error_min_chars} ({reportDescription.length}/10)
                      </p>
                    )}
                  </div>
                  
                  <button
                    onClick={handleSubmitReport}
                    disabled={isReporting || reportDescription.length < 10}
                    className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3 shadow-lg shadow-blue-600/20"
                  >
                    {isReporting ? (
                      <>
                        <Loader2 size={20} className="animate-spin" />
                        {t.common_loading}
                      </>
                    ) : (
                      <>
                        <FileText size={20} />
                        {t.report_btn_submit}
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
