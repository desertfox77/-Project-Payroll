
import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  ChevronLeft, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck,
  ArrowRight,
  Loader2,
  Banknote
} from 'lucide-react';
import { ViewState, User, Language } from '../types';
import { BANK_LIST, BANK_TRANSFER_FEE } from '../constants';
import { translations } from '../translations';

interface BankTransferFormProps {
  onNavigate: (view: ViewState) => void;
  agent: User;
  setAgent: (agent: User) => void;
  language: Language;
}

export const BankTransferForm: React.FC<BankTransferFormProps> = ({ onNavigate, agent, setAgent, language }) => {
  const [step, setStep] = useState<'entry' | 'review' | 'authentication' | 'success'>('entry');
  const [selectedBank, setSelectedBank] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [accountName, setAccountName] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const t = translations[language];

  const filteredBanks = BANK_LIST.filter(bank => 
    bank.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const validateAccount = async () => {
    if (!selectedBank || accountNumber.length < 5) return;
    
    setIsValidating(true);
    setError(null);
    
    // Simulate API call for account validation
    setTimeout(() => {
      setIsValidating(false);
      if (accountNumber === '0661180128' && selectedBank === 'Bank Central Asia (BCA)') {
        setAccountName('Leonardus Wiliem /A');
        setError(null);
      } else if (accountNumber === '1234567890') {
        setError(t.bank_acc_invalid);
        setAccountName('');
      } else {
        setAccountName('JOKO WIDODO');
        setError(null);
      }
    }, 1500);
  };

  useEffect(() => {
    if (accountNumber.length >= 10) {
      validateAccount();
    } else {
      setAccountName('');
      setError(null);
    }
  }, [accountNumber, selectedBank]);

  const handleReview = () => {
    if (!selectedBank || !accountNumber || !amount || !accountName) {
      setError(language === 'en' ? 'Please complete all fields' : 'Harap lengkapi semua bidang');
      return;
    }
    if (parseFloat(amount) + BANK_TRANSFER_FEE > agent.balance) {
      setError(language === 'en' ? 'Insufficient balance (including fee)' : 'Saldo tidak mencukupi (termasuk biaya)');
      return;
    }
    setStep('review');
  };

  const handleAuthorize = () => {
    if (password === 'agent123') {
      setIsProcessing(true);
      setTimeout(() => {
        const total = parseFloat(amount) + BANK_TRANSFER_FEE;
        setAgent({ ...agent, balance: agent.balance - total });
        setIsProcessing(false);
        setStep('success');
      }, 2000);
    } else {
      setError(language === 'en' ? 'Incorrect password' : 'Kata sandi salah');
    }
  };

  if (step === 'success') {
    return (
      <div className="max-w-md mx-auto py-12 text-center space-y-8 animate-fadeIn">
        <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-green-100">
          <CheckCircle2 size={48} />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-black text-slate-900">{t.man_success}</h2>
          <p className="text-slate-500 font-medium">{language === 'en' ? 'Funds have been transferred successfully.' : 'Dana telah berhasil ditransfer.'}</p>
        </div>
        <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 space-y-4">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500 font-bold uppercase tracking-wider">{t.tbl_recipient}</span>
            <span className="text-slate-900 font-black">{accountName}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500 font-bold uppercase tracking-wider">{language === 'en' ? 'Bank' : 'Bank'}</span>
            <span className="text-slate-900 font-black">{selectedBank}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500 font-bold uppercase tracking-wider">{t.tbl_amount}</span>
            <span className="text-slate-900 font-black">Rp {parseFloat(amount).toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500 font-bold uppercase tracking-wider">{language === 'en' ? 'Fee' : 'Biaya'}</span>
            <span className="text-slate-900 font-black">Rp {BANK_TRANSFER_FEE.toLocaleString()}</span>
          </div>
          <div className="pt-4 border-t border-slate-200 flex justify-between text-sm">
            <span className="text-slate-500 font-bold uppercase tracking-wider">{language === 'en' ? 'Total Deduction' : 'Total Potongan'}</span>
            <span className="text-blue-600 font-black">Rp {(parseFloat(amount) + BANK_TRANSFER_FEE).toLocaleString()}</span>
          </div>
        </div>
        <button 
          onClick={() => onNavigate('dashboard')}
          className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-black transition-all shadow-xl shadow-slate-200"
        >
          {language === 'en' ? 'Back to Dashboard' : 'Kembali ke Beranda'}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => step === 'entry' ? onNavigate('disbursement') : setStep('entry')}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
        >
          <ChevronLeft size={24} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{t.bank_title}</h1>
          <p className="text-slate-500 mt-1">{t.bank_subtitle}</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden">
        {step === 'entry' && (
          <div className="p-8 space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">{t.bank_select}</label>
              <div className="relative">
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-left flex items-center justify-between focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                >
                  <div className="flex items-center gap-3">
                    <Building2 size={20} className="text-slate-400" />
                    <span className={selectedBank ? 'text-slate-900' : 'text-slate-400'}>
                      {selectedBank || (language === 'en' ? 'Choose a bank...' : 'Pilih bank...')}
                    </span>
                  </div>
                  <ChevronLeft className={`transition-transform ${isDropdownOpen ? 'rotate-90' : '-rotate-90'}`} size={18} />
                </button>

                {isDropdownOpen && (
                  <div className="absolute z-50 mt-2 w-full bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden animate-fadeInUp">
                    <div className="p-3 border-b border-slate-100">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input 
                          type="text"
                          placeholder={language === 'en' ? 'Search bank...' : 'Cari bank...'}
                          className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="max-h-60 overflow-y-auto custom-scrollbar">
                      {filteredBanks.map((bank) => (
                        <button
                          key={bank}
                          onClick={() => {
                            setSelectedBank(bank);
                            setIsDropdownOpen(false);
                            setSearchQuery('');
                          }}
                          className="w-full px-4 py-3 text-left text-sm font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        >
                          {bank}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">{t.bank_acc_no}</label>
              <div className="relative">
                <input 
                  type="text" 
                  className={`w-full px-4 py-4 bg-slate-50 border rounded-2xl font-bold outline-none transition-all ${error === t.bank_acc_invalid ? 'border-red-500 ring-2 ring-red-100' : 'border-slate-200 focus:ring-2 focus:ring-blue-500'}`}
                  placeholder="e.g. 1234567890"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  {isValidating && <Loader2 size={20} className="text-blue-600 animate-spin" />}
                  {accountName && !isValidating && <CheckCircle2 size={20} className="text-green-500" />}
                  {error === t.bank_acc_invalid && !isValidating && <AlertCircle size={20} className="text-red-500" />}
                </div>
              </div>
              {accountName && (
                <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-xl border border-green-100 animate-fadeIn">
                  <CheckCircle2 size={14} />
                  <span className="text-xs font-black uppercase tracking-wider">{t.bank_acc_valid}: {accountName}</span>
                </div>
              )}
              {error === t.bank_acc_invalid && (
                <div className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-xl border border-red-100 animate-shake">
                  <AlertCircle size={14} />
                  <span className="text-xs font-black uppercase tracking-wider">{error}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">{t.bank_amount}</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-400">Rp</div>
                <input 
                  type="text" 
                  className={`w-full pl-12 pr-4 py-4 bg-slate-50 border rounded-2xl font-bold outline-none transition-all ${error && (error.includes('balance') || error.includes('fields')) ? 'border-red-500 ring-2 ring-red-100' : 'border-slate-200 focus:ring-2 focus:ring-blue-500'}`}
                  placeholder="0"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value.replace(/\D/g, ''));
                    setError(null);
                  }}
                />
              </div>
              {error && (error.includes('balance') || error.includes('fields')) && (
                <div className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-xl border border-red-100 animate-shake">
                  <AlertCircle size={14} />
                  <span className="text-xs font-black uppercase tracking-wider">{error}</span>
                </div>
              )}
              <div className="flex justify-between items-center px-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{language === 'en' ? 'Available Balance' : 'Saldo Tersedia'}</span>
                <span className={`text-xs font-black ${parseFloat(amount) + BANK_TRANSFER_FEE > agent.balance ? 'text-red-600' : 'text-slate-900'}`}>
                  Rp {agent.balance.toLocaleString()}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium italic px-1">
                {language === 'en' ? `* A transaction fee of Rp ${BANK_TRANSFER_FEE.toLocaleString()} will be applied.` : `* Biaya transaksi sebesar Rp ${BANK_TRANSFER_FEE.toLocaleString()} akan dikenakan.`}
              </p>
            </div>

            <button 
              onClick={handleReview}
              disabled={!selectedBank || !accountNumber || !amount || !accountName || !!error}
              className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl shadow-blue-100 flex items-center justify-center gap-2"
            >
              {t.bank_btn_review}
              <ArrowRight size={20} />
            </button>
          </div>
        )}

        {step === 'review' && (
          <div className="p-8 space-y-8 animate-fadeIn">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search size={32} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{language === 'en' ? 'Transfer Review' : 'Tinjau Transfer'}</h3>
              <p className="text-slate-500 font-medium">{language === 'en' ? 'Please double-check the recipient and amount before authorizing.' : 'Harap periksa kembali penerima dan jumlah sebelum mengotorisasi.'}</p>
            </div>

            <div className="bg-slate-50 rounded-[2rem] p-8 border border-slate-200 shadow-inner space-y-8">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t.tbl_recipient}</p>
                  <h4 className="text-2xl font-black text-slate-900">{accountName}</h4>
                  <div className="flex items-center gap-2 text-slate-500 font-bold">
                    <Building2 size={16} />
                    <span>{selectedBank}</span>
                  </div>
                  <p className="text-sm font-mono text-slate-400 tracking-wider">{accountNumber}</p>
                </div>
                <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
                  <ShieldCheck size={24} className="text-blue-600" />
                </div>
              </div>

              <div className="h-px bg-slate-200 w-full"></div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">{language === 'en' ? 'Transfer Amount' : 'Jumlah Transfer'}</span>
                  <span className="text-xl font-black text-slate-900">Rp {parseFloat(amount).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">{language === 'en' ? 'Transaction Fee' : 'Biaya Transaksi'}</span>
                  <span className="text-sm font-black text-slate-900">Rp {BANK_TRANSFER_FEE.toLocaleString()}</span>
                </div>
                <div className="pt-6 mt-2 border-t-2 border-dashed border-slate-300 flex justify-between items-center">
                  <span className="text-lg font-black text-slate-900 uppercase tracking-widest">{language === 'en' ? 'Total Payment' : 'Total Pembayaran'}</span>
                  <div className="text-right">
                    <span className="text-3xl font-black text-blue-600">Rp {(parseFloat(amount) + BANK_TRANSFER_FEE).toLocaleString()}</span>
                    <p className="text-[10px] font-bold text-slate-400 mt-1 italic">{language === 'en' ? 'Deducted from agent balance' : 'Dipotong dari saldo agen'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => setStep('entry')}
                className="flex-1 py-4 border border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition-all"
              >
                {t.man_btn_cancel}
              </button>
              <button 
                onClick={() => setStep('authentication')}
                className="flex-[2] py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 flex items-center justify-center gap-2"
              >
                {language === 'en' ? 'Confirm & Authorize' : 'Konfirmasi & Otorisasi'}
                <ArrowRight size={20} />
              </button>
            </div>
          </div>
        )}

        {step === 'authentication' && (
          <div className="p-8 space-y-8 animate-fadeIn">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheck size={32} />
              </div>
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">{t.man_auth_title}</h3>
              <p className="text-slate-500 font-medium">{t.man_auth_desc}</p>
            </div>

            <div className="space-y-4">
              <input 
                type="password" 
                className={`w-full px-4 py-4 bg-slate-50 border rounded-2xl font-bold text-center text-2xl tracking-[1em] outline-none transition-all ${error ? 'border-red-500 ring-2 ring-red-100' : 'border-slate-200 focus:ring-2 focus:ring-blue-500'}`}
                placeholder="••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(null);
                }}
                autoFocus
              />
              {error && (
                <p className="text-center text-sm font-bold text-red-600 animate-shake">{error}</p>
              )}
            </div>

            <button 
              onClick={handleAuthorize}
              disabled={isProcessing || password.length < 4}
              className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-black disabled:opacity-50 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  {t.common_loading}
                </>
              ) : (
                <>
                  <Banknote size={20} />
                  {t.bank_btn_confirm}
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
