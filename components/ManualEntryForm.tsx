
import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  Phone, 
  Banknote, 
  AlignLeft, 
  ShieldCheck, 
  AlertCircle,
  CheckCircle2,
  XCircle,
  Loader2,
  User as UserIcon,
  ShieldAlert
} from 'lucide-react';
import { ViewState, Disbursement, User, Recipient, Language } from '../types';
import { validateDisbursement, findRecipient } from '../services/payrollService';
import { normalizePhoneNumber } from '../services/disbursementService';
import { translations } from '../translations';

interface ManualEntryFormProps {
  onNavigate: (view: ViewState) => void;
  agent: User;
  setAgent: (user: User) => void;
  language: Language;
}

type Step = 'input' | 'confirmation' | 'authentication' | 'processing' | 'result';

export const ManualEntryForm: React.FC<ManualEntryFormProps> = ({ onNavigate, agent, setAgent, language }) => {
  const [step, setStep] = useState<Step>('input');
  const [formData, setFormData] = useState({ phoneNumber: '', amount: '', description: '' });
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [validatedTx, setValidatedTx] = useState<Disbursement | null>(null);
  const [foundRecipient, setFoundRecipient] = useState<Recipient | null>(null);
  const t = translations[language];

  useEffect(() => {
    const normalized = normalizePhoneNumber(formData.phoneNumber);
    if (normalized.length >= 8) {
      const recipient = findRecipient(formData.phoneNumber);
      setFoundRecipient(recipient || null);
    } else {
      setFoundRecipient(null);
    }
  }, [formData.phoneNumber]);

  const handleInitialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(formData.amount);
    const tx = validateDisbursement({ 
      phoneNumber: formData.phoneNumber, 
      amount, 
      description: formData.description 
    });

    if (tx.status === 'invalid') {
      if (tx.error === 'Phone number not registered') {
        setError(null);
        return;
      }
      setError(tx.error || 'Validation failed');
    } else {
      setError(null);
      setValidatedTx(tx);
      setStep('confirmation');
    }
  };

  const handleAuthenticate = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '12345678') {
      setError(null);
      processTransaction();
    } else {
      setError(language === 'en' ? 'Incorrect password. Please try again.' : 'Kata sandi salah. Silakan coba lagi.');
    }
  };

  const processTransaction = async () => {
    setStep('processing');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    if (validatedTx) {
      const isSuccess = Math.random() > 0.1;
      if (isSuccess) {
        setValidatedTx({ ...validatedTx, status: 'success' });
        setAgent({ ...agent, balance: agent.balance - validatedTx.totalDeduction });
      } else {
        setValidatedTx({ ...validatedTx, status: 'failed', error: language === 'en' ? 'Network communication timeout' : 'Waktu komunikasi jaringan habis' });
      }
    }
    setStep('result');
  };

  const renderStep = () => {
    switch (step) {
      case 'input':
        return (
          <form onSubmit={handleInitialSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">{t.man_phone}</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    required
                    placeholder="e.g., 0812..., 62812..., or +62812..."
                    className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                    value={formData.phoneNumber}
                    onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })}
                  />
                </div>
                {foundRecipient && (
                  <div className={`mt-2 flex items-center gap-2 px-3 py-2 rounded-lg border animate-fadeIn ${
                    foundRecipient.registered 
                    ? 'bg-green-50 text-green-700 border-green-100' 
                    : 'bg-amber-50 text-amber-700 border-amber-100'
                  }`}>
                    {foundRecipient.registered ? <UserIcon size={14} /> : <ShieldAlert size={14} />}
                    <span className="text-xs font-bold uppercase tracking-tight">
                      {foundRecipient.name} • {foundRecipient.registered 
                        ? (language === 'en' ? 'Verified' : 'Terverifikasi') 
                        : (language === 'en' ? 'Unverified (Not KYC)' : 'Belum Verifikasi')}
                    </span>
                  </div>
                )}
                {!foundRecipient && normalizePhoneNumber(formData.phoneNumber).length >= 10 && (
                  <div className="mt-2 flex items-center gap-2 px-3 py-2 bg-slate-50 text-slate-500 rounded-lg border border-slate-100">
                    <AlertCircle size={14} />
                    <span className="text-xs font-medium">{language === 'en' ? 'No registered recipient found.' : 'Penerima tidak terdaftar.'}</span>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">{t.man_amount}</label>
                <div className="relative">
                  <Banknote className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="number" 
                    required
                    min="1"
                    step="1"
                    placeholder="0"
                    className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                    value={formData.amount}
                    onChange={e => setFormData({ ...formData, amount: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">{t.man_desc}</label>
                <div className="relative">
                  <AlignLeft className="absolute left-4 top-4 text-slate-400" size={18} />
                  <textarea 
                    rows={3}
                    placeholder={language === 'en' ? 'Salary disbursement for...' : 'Penyaluran gaji untuk...'}
                    className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none resize-none"
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                  ></textarea>
                </div>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 animate-shake">
                <AlertCircle size={20} className="shrink-0" />
                <p className="text-sm font-semibold">{error}</p>
              </div>
            )}

            <div className="flex items-center gap-4 pt-4">
              <button 
                type="button"
                onClick={() => onNavigate('payroll')}
                className="flex-1 px-6 py-3.5 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors"
              >
                {t.man_btn_cancel}
              </button>
              <button 
                type="submit"
                disabled={!foundRecipient}
                className={`flex-1 px-6 py-3.5 text-white font-bold rounded-xl shadow-lg transition-all ${!foundRecipient ? 'bg-slate-400 cursor-not-allowed opacity-70' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'}`}
              >
                {t.man_btn_review}
              </button>
            </div>
          </form>
        );

      case 'confirmation':
        const recipient = findRecipient(validatedTx?.phoneNumber || '');
        return (
          <div className="space-y-6">
            <h3 className="font-black text-slate-900 text-lg">{t.man_review_title}</h3>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                <span className="text-slate-500 font-medium">{language === 'en' ? 'Recipient Name' : 'Nama Penerima'}</span>
                <span className="text-slate-900 font-bold">{recipient?.name || 'Unknown'}</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                <span className="text-slate-500 font-medium">{language === 'en' ? 'Phone Number' : 'Nomor Telepon'}</span>
                <span className="text-slate-900 font-bold">{validatedTx?.phoneNumber}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">{language === 'en' ? 'Amount' : 'Jumlah'}</span>
                <span className="text-slate-900 font-bold">Rp {validatedTx?.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">{language === 'en' ? 'Service Fee' : 'Biaya Layanan'}</span>
                <span className="text-slate-900 font-bold">Rp {validatedTx?.fee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-slate-200">
                <span className="text-slate-900 font-bold">{language === 'en' ? 'Total Deduction' : 'Total Potongan'}</span>
                <span className="text-blue-600 text-xl font-black">Rp {validatedTx?.totalDeduction.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button 
                onClick={() => setStep('input')}
                className="flex-1 px-6 py-3.5 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors"
              >
                {t.common_edit}
              </button>
              <button 
                onClick={() => setStep('authentication')}
                className="flex-1 px-6 py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all"
              >
                {t.common_authorize}
              </button>
            </div>
          </div>
        );

      case 'authentication':
        return (
          <form onSubmit={handleAuthenticate} className="space-y-6 text-center">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldCheck size={32} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">{t.man_auth_title}</h3>
              <p className="text-slate-500 mt-2">{t.man_auth_desc}</p>
              <p className="font-bold text-slate-900 mt-1">Rp {validatedTx?.totalDeduction.toLocaleString()}</p>
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
              <div className="flex items-center gap-3 p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 animate-shake justify-center">
                <AlertCircle size={20} className="shrink-0" />
                <p className="text-sm font-semibold">{error}</p>
              </div>
            )}

            <div className="flex items-center gap-4">
              <button 
                type="button"
                onClick={() => setStep('confirmation')}
                className="flex-1 px-6 py-3.5 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors"
              >
                {t.man_btn_cancel}
              </button>
              <button 
                type="submit"
                className="flex-1 px-6 py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all"
              >
                {t.man_confirm_btn}
              </button>
            </div>
          </form>
        );

      case 'processing':
        return (
          <div className="py-12 flex flex-col items-center justify-center space-y-6 text-center">
            <div className="relative">
              <Loader2 size={64} className="text-blue-600 animate-spin" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">{t.common_loading}</h3>
              <p className="text-slate-500 mt-2">{language === 'en' ? 'Connecting to secure banking gateway...' : 'Menghubungkan ke gerbang perbankan aman...'}</p>
            </div>
          </div>
        );

      case 'result':
        const isSuccess = validatedTx?.status === 'success';
        return (
          <div className="space-y-8 text-center py-6">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto ${isSuccess ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
              {isSuccess ? <CheckCircle2 size={48} /> : <XCircle size={48} />}
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900">{isSuccess ? t.man_success : t.man_failed}</h3>
              <p className="text-slate-500 mt-2">
                {isSuccess 
                  ? (language === 'en' ? `Funds successfully disbursed to ${validatedTx?.phoneNumber}.` : `Dana berhasil disalurkan ke ${validatedTx?.phoneNumber}.`)
                  : (language === 'en' ? `Reason: ${validatedTx?.error}` : `Alasan: ${validatedTx?.error}`)
                }
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-6 max-w-sm mx-auto space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">{language === 'en' ? 'Receipt No:' : 'No. Resi:'}</span>
                <span className="text-slate-900 font-bold">#PS-{Math.floor(Math.random() * 900000 + 100000)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">{language === 'en' ? 'Amount Paid:' : 'Jumlah Dibayar:'}</span>
                <span className="text-slate-900 font-bold">Rp {validatedTx?.totalDeduction.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">{language === 'en' ? 'New Balance:' : 'Saldo Baru:'}</span>
                <span className="text-slate-900 font-bold">Rp {agent.balance.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex items-center gap-4 pt-4">
              <button 
                onClick={() => onNavigate('dashboard')}
                className="flex-1 px-6 py-3.5 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors"
              >
                {language === 'en' ? 'Go to Dashboard' : 'Ke Beranda'}
              </button>
              <button 
                onClick={() => onNavigate('payroll')}
                className="flex-1 px-6 py-3.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-black shadow-lg shadow-slate-200 transition-all"
              >
                {language === 'en' ? 'Make Another' : 'Buat Lagi'}
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => step === 'input' ? onNavigate('payroll') : setStep('input')}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
        >
          <ChevronLeft size={24} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{t.pay_manual_title}</h1>
          <p className="text-slate-500">{language === 'en' ? 'Fill in the recipient details below.' : 'Isi detail penerima di bawah ini.'}</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xl shadow-slate-200/50">
        {renderStep()}
      </div>
    </div>
  );
};
