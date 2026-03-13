
import React, { useState, useRef } from 'react';
import { 
  ChevronLeft, 
  UploadCloud, 
  FileSpreadsheet, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  ShieldCheck,
  Loader2,
  Download,
  Trash2,
  RefreshCw,
  Info,
  AlertTriangle,
  FileWarning
} from 'lucide-react';
import { ViewState, Disbursement, User, BatchSummary, Language } from '../types';
import { validateDisbursement, calculateBatchSummary, processTransactions, downloadDisbursementTemplate, normalizePhoneNumber } from '../services/disbursementService';
import { translations } from '../translations';

interface BulkUploadFormProps {
  onNavigate: (view: ViewState) => void;
  agent: User;
  setAgent: (user: User) => void;
  language: Language;
}

type Step = 'upload' | 'validation' | 'summary' | 'authentication' | 'processing' | 'result';

export const BulkUploadForm: React.FC<BulkUploadFormProps> = ({ onNavigate, agent, setAgent, language }) => {
  const [step, setStep] = useState<Step>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [disbursements, setDisbursements] = useState<Disbursement[]>([]);
  const [summary, setSummary] = useState<BatchSummary | null>(null);
  const [scheduleType, setScheduleType] = useState<'realtime' | 'scheduled'>('realtime');
  const [scheduledTime, setScheduledTime] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = translations[language];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
        setError(language === 'en' ? 'Invalid file format. Please upload a standard CSV file.' : 'Format file tidak valid. Silakan unggah file CSV standar.');
        return;
      }
      setFile(selectedFile);
      setError(null);
      parseAndValidateCSV(selectedFile);
    }
  };

  const parseAndValidateCSV = async (file: File) => {
    setStep('validation');
    setError(null);
    
    try {
      const text = await file.text();
      if (!text.trim()) {
        throw new Error(language === 'en' ? 'The uploaded file is empty. Please add data to your CSV.' : 'File yang diunggah kosong. Silakan tambahkan data ke CSV Anda.');
      }

      const rows = text.split(/\r?\n/).map(row => row.trim()).filter(row => row.length > 0);
      if (rows.length < 1) {
        throw new Error(language === 'en' ? 'No valid content found in the file.' : 'Tidak ada konten valid yang ditemukan dalam file.');
      }

      const headers = rows[0].split(',').map(h => h.trim().toLowerCase());
      const expectedHeaders = ['phone number', 'amount', 'description'];
      
      const missingHeaders = expectedHeaders.filter(h => !headers.includes(h));
      
      if (missingHeaders.length > 0) {
        const formattedMissing = missingHeaders.map(h => `"${h.toUpperCase()}"`).join(', ');
        throw new Error(`${t.bulk_mismatch}: ${language === 'en' ? 'Your CSV is missing the following required columns' : 'CSV Anda kekurangan kolom berikut'}: ${formattedMissing}.`);
      }

      if (rows.length < 2) {
        throw new Error(language === 'en' ? 'The file contains a header but no disbursement records.' : 'File berisi header tetapi tidak ada catatan penyaluran.');
      }

      const phoneIdx = headers.indexOf('phone number');
      const amountIdx = headers.indexOf('amount');
      const descIdx = headers.indexOf('description');

      await new Promise(resolve => setTimeout(resolve, 1200));

      const batchRunningTotals = new Map<string, number>();

      const parsedData = rows.slice(1).map((row, lineIndex) => {
        const columns = row.split(',');
        const phoneNumber = columns[phoneIdx]?.trim() || '';
        const amountStr = columns[amountIdx]?.trim() || '0';
        const amount = parseFloat(amountStr);
        const description = columns[descIdx]?.trim() || '';
        
        if (isNaN(amount)) {
          return {
            phoneNumber,
            amount: 0,
            description,
            fee: 0,
            totalDeduction: 0,
            status: 'invalid' as const,
            error: `Line ${lineIndex + 2}: ${language === 'en' ? 'Invalid amount value' : 'Nilai jumlah tidak valid'} "${amountStr}"`
          };
        }

        const normalized = normalizePhoneNumber(phoneNumber);
        const previousAmount = batchRunningTotals.get(normalized) || 0;
        
        const result = validateDisbursement({
          phoneNumber,
          amount,
          description
        }, previousAmount);

        if (result.status === 'valid') {
          batchRunningTotals.set(normalized, previousAmount + amount);
        }
        
        return result;
      });

      setDisbursements(parsedData);
      setSummary(calculateBatchSummary(parsedData));
      setStep('summary');
    } catch (err: any) {
      setError(err.message || 'An error occurred while parsing the file.');
      setStep('upload');
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAuthorize = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '12345678') {
      setError(null);
      runBatchProcessing();
    } else {
      setError(language === 'en' ? 'Incorrect password.' : 'Kata sandi salah.');
    }
  };

  const runBatchProcessing = async () => {
    setStep('processing');
    
    if (scheduleType === 'scheduled') {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setStep('result');
      return;
    }

    const processed = await processTransactions(disbursements);
    setDisbursements(processed);
    
    const finalSummary = calculateBatchSummary(processed);
    setSummary(finalSummary);
    
    const successTotal = processed
      .filter(d => d.status === 'success')
      .reduce((sum, d) => sum + d.totalDeduction, 0);
      
    setAgent({ ...agent, balance: agent.balance - successTotal });
    setStep('result');
  };

  const handleDownloadReport = () => {
    if (disbursements.length === 0) return;

    const headers = ['Phone Number', 'Recipient Name', 'Amount', 'Description', 'Fee', 'Total Deduction', 'Status', 'Error'];
    const csvRows = disbursements.map(d => [
      d.phoneNumber,
      d.recipientName || d.phoneNumber,
      d.amount.toString(),
      d.description || '',
      d.fee.toString(),
      d.totalDeduction.toString(),
      d.status,
      d.error || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...csvRows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `disbursement_batch_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isScheduleValid = () => {
    if (scheduleType === 'realtime') return true;
    if (!scheduledTime) return false;
    const selected = new Date(scheduledTime);
    const minAllowed = new Date();
    minAllowed.setMinutes(minAllowed.getMinutes() + 55); // Allow a small buffer for processing time
    return selected >= minAllowed;
  };

  const handleProceedToAuth = () => {
    if (scheduleType === 'scheduled') {
      const selected = new Date(scheduledTime);
      const minAllowed = new Date();
      minAllowed.setHours(minAllowed.getHours() + 1);
      
      if (selected < minAllowed) {
        setError(language === 'en' 
          ? 'Scheduled time must be at least 1 hour from now. Please update the schedule.' 
          : 'Waktu penjadwalan minimal 1 jam dari sekarang. Silakan perbarui jadwal.');
        return;
      }
    }
    setError(null);
    setStep('authentication');
  };

  const renderStep = () => {
    switch (step) {
      case 'upload':
        return (
          <div className="space-y-8">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-3xl p-12 flex flex-col items-center justify-center cursor-pointer transition-all group ${error ? 'border-red-200 bg-red-50/30' : 'border-slate-200 hover:border-blue-400 hover:bg-blue-50/50'}`}
            >
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${error ? 'bg-red-100 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                {error ? <FileWarning size={32} /> : <UploadCloud size={32} />}
              </div>
              <h3 className={`text-xl font-bold mb-2 ${error ? 'text-red-900' : 'text-slate-900'}`}>
                {error ? (language === 'en' ? 'Upload Failed' : 'Gagal Upload') : t.bulk_upload_title}
              </h3>
              <p className="text-slate-500 text-center max-w-xs leading-relaxed">
                {error ? (language === 'en' ? 'Please check the error message below.' : 'Harap periksa pesan kesalahan di bawah.') : t.bulk_upload_desc}
              </p>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept=".csv"
                onChange={handleFileChange} 
              />
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <FileSpreadsheet className="text-slate-400" />
                <span className="text-slate-600 font-medium">disbursement_template.csv</span>
              </div>
              <button 
                onClick={downloadDisbursementTemplate}
                className="text-blue-600 font-bold hover:underline flex items-center gap-2"
              >
                <Download size={16} />
                {t.dash_template}
              </button>
            </div>

            {error && (
              <div className="flex items-start gap-3 p-5 bg-red-50 text-red-700 rounded-2xl border border-red-100 animate-shake">
                <AlertCircle size={20} className="shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-bold uppercase tracking-wider">{language === 'en' ? 'Error Details' : 'Rincian Kesalahan'}</p>
                  <p className="text-sm leading-relaxed">{error}</p>
                </div>
              </div>
            )}
          </div>
        );

      case 'validation':
        return (
          <div className="py-12 flex flex-col items-center justify-center space-y-6">
            <Loader2 size={48} className="text-blue-600 animate-spin" />
            <div className="text-center">
              <h3 className="text-xl font-bold text-slate-900">{t.bulk_validating}</h3>
              <p className="text-slate-500 mt-2">{t.bulk_validating_desc}</p>
            </div>
          </div>
        );

      case 'summary':
        if (summary) {
          return (
            <div className="space-y-8">
              <div className="bg-amber-50 border-l-4 border-amber-500 p-6 rounded-r-2xl flex gap-4 animate-pulse">
                <AlertTriangle className="text-amber-500 shrink-0" size={24} />
                <div className="space-y-1">
                  <h4 className="text-sm font-black text-amber-900 uppercase tracking-wider">
                    {language === 'en' ? 'Attention: Final Recheck Required' : 'Perhatian: Tinjauan Ulang Diperlukan'}
                  </h4>
                  <p className="text-sm text-amber-700 font-medium leading-relaxed">
                    {language === 'en' 
                      ? 'Agent must manually verify all recipient names and amounts. Ensure the bulk data matches your official payroll records before proceeding to authorization.' 
                      : 'Agen harus memverifikasi semua nama penerima dan jumlah secara manual. Pastikan data massal sesuai dengan catatan penggajian resmi Anda sebelum melanjutkan ke otorisasi.'}
                  </p>
                </div>
              </div>

              {error && (
                <div className="relative overflow-hidden bg-white border-2 border-red-500 rounded-3xl shadow-2xl shadow-red-200/50 animate-shake">
                  <div className="absolute top-0 left-0 w-2 h-full bg-red-500"></div>
                  <div className="p-6 flex items-start gap-5">
                    <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center shrink-0 shadow-inner">
                      <AlertCircle size={28} />
                    </div>
                    <div className="space-y-1.5">
                      <h4 className="text-base font-black text-red-900 uppercase tracking-tight">
                        {language === 'en' ? 'Action Required: Schedule Error' : 'Perlu Tindakan: Kesalahan Jadwal'}
                      </h4>
                      <p className="text-sm text-red-700 font-bold leading-relaxed">
                        {error}
                      </p>
                    </div>
                  </div>
                  <div className="bg-red-50 px-6 py-3 flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">
                      {language === 'en' ? 'Please adjust the time below' : 'Silakan sesuaikan waktu di bawah'}
                    </span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">{t.bulk_valid_rec}</p>
                  <p className="text-2xl font-black text-green-600">{summary.validCount}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">{t.bulk_invalid_rec}</p>
                  <p className="text-2xl font-black text-red-600">{summary.invalidCount}</p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-slate-900">{t.bulk_sched_title}</h4>
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-6">
                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative flex items-center justify-center">
                        <input 
                          type="radio" 
                          name="scheduleType" 
                          className="peer appearance-none w-6 h-6 border-2 border-slate-300 rounded-full checked:border-blue-600 transition-all"
                          checked={scheduleType === 'realtime'}
                          onChange={() => {
                            setScheduleType('realtime');
                            if (error) setError(null);
                          }}
                        />
                        <div className="absolute w-3 h-3 bg-blue-600 rounded-full scale-0 peer-checked:scale-100 transition-transform"></div>
                      </div>
                      <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900 transition-colors">{t.bulk_sched_realtime}</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative flex items-center justify-center">
                        <input 
                          type="radio" 
                          name="scheduleType" 
                          className="peer appearance-none w-6 h-6 border-2 border-slate-300 rounded-full checked:border-blue-600 transition-all"
                          checked={scheduleType === 'scheduled'}
                          onChange={() => setScheduleType('scheduled')}
                        />
                        <div className="absolute w-3 h-3 bg-blue-600 rounded-full scale-0 peer-checked:scale-100 transition-transform"></div>
                      </div>
                      <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900 transition-colors">{t.bulk_sched_scheduled}</span>
                    </label>
                  </div>

                  {scheduleType === 'scheduled' && (
                    <div className="space-y-2 animate-fadeIn">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">{t.bulk_sched_time}</label>
                      <input 
                        type="datetime-local" 
                        className={`w-full px-4 py-3 bg-white border rounded-xl font-bold outline-none transition-all ${error ? 'border-red-500 ring-2 ring-red-100' : 'border-slate-200 focus:ring-2 focus:ring-blue-500'}`}
                        value={scheduledTime}
                        onChange={(e) => {
                          setScheduledTime(e.target.value);
                          if (error) setError(null);
                        }}
                        min={(() => {
                          const now = new Date();
                          now.setHours(now.getHours() + 1);
                          const offset = now.getTimezoneOffset() * 60000;
                          return new Date(now.getTime() - offset).toISOString().slice(0, 16);
                        })()}
                      />
                      <p className="text-[10px] text-slate-500 font-medium italic">
                        {language === 'en' 
                          ? 'Scheduled time must be at least 1 hour from now.' 
                          : 'Waktu penjadwalan minimal 1 jam dari sekarang.'}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-slate-900">{t.bulk_summary_title}</h4>
                <div className={`rounded-2xl p-6 space-y-4 transition-all ${agent.balance < (summary.totalAmount + summary.totalFees) ? 'bg-red-900 ring-4 ring-red-100' : 'bg-slate-900'}`}>
                  <div className="flex justify-between items-center opacity-70 text-white">
                    <span>{language === 'en' ? 'Total Amount' : 'Total Jumlah'}</span>
                    <span className="font-bold">Rp {summary.totalAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center opacity-70 text-white">
                    <span>{language === 'en' ? 'Total Service Fees' : 'Total Biaya Layanan'}</span>
                    <span className="font-bold">Rp {summary.totalFees.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-slate-700 text-white">
                    <span className="font-bold">{t.bulk_total_cost}</span>
                    <span className={`text-xl font-black ${agent.balance < (summary.totalAmount + summary.totalFees) ? 'text-red-400' : 'text-blue-400'}`}>
                      Rp {(summary.totalAmount + summary.totalFees).toLocaleString()}
                    </span>
                  </div>
                  {agent.balance < (summary.totalAmount + summary.totalFees) && (
                    <div className="pt-4 border-t border-red-800 flex items-start gap-3 text-red-200">
                      <AlertCircle size={18} className="shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <p className="text-xs font-black uppercase tracking-widest">{language === 'en' ? 'Insufficient Balance' : 'Saldo Tidak Cukup'}</p>
                        <p className="text-[10px] font-medium leading-relaxed">
                          {language === 'en' 
                            ? `Your current balance (Rp ${agent.balance.toLocaleString()}) is below the total batch cost. Please top up your account to proceed.` 
                            : `Saldo Anda saat ini (Rp ${agent.balance.toLocaleString()}) di bawah total biaya batch. Silakan top up akun Anda untuk melanjutkan.`}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-slate-900">{t.bulk_preview}</h4>
                <div className="max-h-64 overflow-y-auto custom-scrollbar border border-slate-100 rounded-xl divide-y divide-slate-100">
                  {disbursements.map((tx, idx) => (
                    <div key={idx} className={`p-4 flex items-center justify-between transition-colors ${tx.status === 'invalid' ? 'bg-red-50/50' : 'bg-white hover:bg-slate-50'}`}>
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-slate-900">{tx.recipientName || tx.phoneNumber}</span>
                        <span className="text-xs text-slate-500 font-mono">{tx.phoneNumber}</span>
                        {tx.description && (
                          <span className="text-[10px] text-slate-400 italic mt-0.5">"{tx.description}"</span>
                        )}
                        {tx.status === 'invalid' && <span className="text-[10px] text-red-500 font-bold uppercase mt-1 leading-tight max-w-xs">{tx.error}</span>}
                      </div>
                      <div className="text-right shrink-0 ml-4">
                        <span className="text-sm font-black text-slate-900">Rp {tx.amount.toLocaleString()}</span>
                        {tx.status === 'valid' && <div className="text-[10px] text-green-600 font-bold uppercase">{t.bulk_ready}</div>}
                        {tx.status === 'invalid' && <div className="text-[10px] text-red-600 font-bold uppercase">{language === 'en' ? 'Invalid' : 'Tidak Valid'}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setStep('upload')}
                  className="flex-1 px-6 py-3.5 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCw size={18} />
                  {t.bulk_reupload}
                </button>
                <button 
                  onClick={handleProceedToAuth}
                  disabled={summary.validCount === 0 || (scheduleType === 'scheduled' && !scheduledTime) || agent.balance < (summary.totalAmount + summary.totalFees)}
                  className={`flex-1 px-6 py-3.5 bg-blue-600 text-white font-bold rounded-xl shadow-lg transition-all ${summary.validCount === 0 || (scheduleType === 'scheduled' && !scheduledTime) || agent.balance < (summary.totalAmount + summary.totalFees) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700 shadow-blue-200'}`}
                >
                  {scheduleType === 'scheduled' 
                    ? (language === 'en' ? 'Review Schedule' : 'Tinjau Jadwal')
                    : t.bulk_authorize_btn}
                </button>
              </div>
            </div>
          );
        }
        return null;

      case 'authentication':
        return (
          <form onSubmit={handleAuthorize} className="space-y-6 text-center">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldCheck size={32} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">{t.man_auth_title}</h3>
              <p className="text-slate-500 mt-2">
                {language === 'en' ? 'Confirm processing of' : 'Konfirmasi pemrosesan'} <span className="text-slate-900 font-bold">{summary?.validCount}</span> {language === 'en' ? 'records totaling' : 'catatan senilai'} <span className="text-slate-900 font-bold">Rp {(summary!.totalAmount + summary!.totalFees).toLocaleString()}</span>
                {scheduleType === 'scheduled' && (
                  <> {language === 'en' ? 'scheduled for' : 'dijadwalkan pada'} <span className="text-blue-600 font-bold">{new Date(scheduledTime).toLocaleString()}</span></>
                )}
                .
              </p>
            </div>
            
            <input 
              type="password"
              required
              autoFocus
              placeholder="••••••••"
              className="w-full px-4 py-4 bg-white border border-slate-200 rounded-xl text-center text-2xl tracking-[0.5em] focus:ring-2 focus:ring-blue-500 outline-none"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />

            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 justify-center">
                <AlertCircle size={20} className="shrink-0" />
                <p className="text-sm font-semibold">{error}</p>
              </div>
            )}

            <div className="flex items-center gap-4">
              <button 
                type="button"
                onClick={() => setStep('summary')}
                className="flex-1 px-6 py-3.5 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors"
              >
                {t.man_btn_cancel}
              </button>
              <button 
                type="submit"
                className="flex-1 px-6 py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all"
              >
                {scheduleType === 'scheduled' 
                  ? (language === 'en' ? 'Confirm Schedule' : 'Konfirmasi Jadwal')
                  : (language === 'en' ? 'Process Batch' : 'Proses Batch')}
              </button>
            </div>
          </form>
        );

      case 'processing':
        return (
          <div className="py-12 flex flex-col items-center justify-center space-y-6 text-center">
            <Loader2 size={64} className="text-blue-600 animate-spin" />
            <div>
              <h3 className="text-xl font-bold text-slate-900">{t.bulk_processing}</h3>
              <p className="text-slate-500 mt-2">{t.bulk_processing_desc}</p>
            </div>
          </div>
        );

      case 'result':
        const successfulOnes = disbursements.filter(d => d.status === 'success');
        const failedOnes = disbursements.filter(d => d.status === 'failed' || d.status === 'invalid');

        return (
          <div className="space-y-8 text-center">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 size={48} />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900">
                {scheduleType === 'scheduled' 
                  ? (language === 'en' ? 'Batch Scheduled Successfully' : 'Batch Berhasil Dijadwalkan')
                  : t.bulk_complete_title}
              </h3>
              <p className="text-slate-500 mt-2">
                {scheduleType === 'scheduled'
                  ? (language === 'en' ? `Your batch has been scheduled for ${new Date(scheduledTime).toLocaleString()}.` : `Batch Anda telah dijadwalkan untuk ${new Date(scheduledTime).toLocaleString()}.`)
                  : (language === 'en' ? 'Processing report for the uploaded file.' : 'Laporan pemrosesan untuk file yang diunggah.')}
              </p>
            </div>

            {scheduleType === 'realtime' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 p-4 rounded-2xl border border-green-100">
                  <p className="text-xs font-bold text-green-600 uppercase mb-1">{language === 'en' ? 'Successful' : 'Berhasil'}</p>
                  <p className="text-3xl font-black text-green-700">{successfulOnes.length}</p>
                </div>
                <div className="bg-red-50 p-4 rounded-2xl border border-red-100">
                  <p className="text-xs font-bold text-red-600 uppercase mb-1">{language === 'en' ? 'Failed' : 'Gagal'}</p>
                  <p className="text-3xl font-black text-red-700">{failedOnes.length}</p>
                </div>
              </div>
            )}

            {scheduleType === 'realtime' && (
              <button 
                onClick={handleDownloadReport}
                className="w-full flex items-center justify-center gap-2 py-4 border border-slate-200 rounded-2xl font-bold hover:bg-slate-50 transition-colors"
              >
                <Download size={20} />
                {t.bulk_report_btn}
              </button>
            )}

            <div className="flex items-center gap-4 pt-4">
              <button 
                onClick={() => onNavigate(scheduleType === 'scheduled' ? 'scheduled' : 'dashboard')}
                className="flex-1 px-6 py-3.5 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors"
              >
                {scheduleType === 'scheduled' 
                  ? (language === 'en' ? 'View Scheduled' : 'Lihat Terjadwal')
                  : (language === 'en' ? 'Go to Dashboard' : 'Ke Beranda')}
              </button>
              <button 
                onClick={() => onNavigate('disbursement')}
                className="flex-1 px-6 py-3.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-black transition-all"
              >
                {language === 'en' ? 'Process More' : 'Proses Lagi'}
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => onNavigate('disbursement')}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
        >
          <ChevronLeft size={24} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{t.bulk_upload_title}</h1>
          <p className="text-slate-500">{language === 'en' ? 'Upload a CSV file with multiple disbursements.' : 'Unggah file CSV dengan beberapa penyaluran.'}</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xl shadow-slate-200/50">
        {renderStep()}
      </div>
    </div>
  );
};
