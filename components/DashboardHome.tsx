
import React, { useState } from 'react';
import { 
  TrendingUp, 
  Users, 
  ArrowUpRight, 
  CreditCard, 
  PlusCircle, 
  FileUp, 
  Download, 
  Wallet, 
  X, 
  CheckCircle2, 
  Loader2, 
  Clock,
  Info
} from 'lucide-react';
import { ViewState, User, Language } from '../types';
import { RECENT_TRANSACTIONS } from '../constants';
import { downloadDisbursementTemplate } from '../services/disbursementService';
import { translations } from '../translations';

interface DashboardHomeProps {
  onNavigate: (view: ViewState) => void;
  agent: User;
  setAgent: (user: User) => void;
  language: Language;
}

export const DashboardHome: React.FC<DashboardHomeProps> = ({ onNavigate, agent, setAgent, language }) => {
  const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [topUpStep, setTopUpStep] = useState<'input' | 'processing' | 'success' | 'error'>('input');
  const [topUpTxCode, setTopUpTxCode] = useState('');
  const t = translations[language];

  const stats = [
    { label: t.dash_balance, value: `Rp ${agent.balance.toLocaleString()}`, icon: CreditCard, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: t.dash_recipients, value: '450+', icon: Users, color: 'text-purple-600', bg: 'bg-purple-50', hasInfo: true, infoText: language === 'en' ? 'Total number of active recipients' : 'Total penerima aktif' },
    { label: t.dash_disbursed, value: 'Rp 12,450,000', icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
  ];

  const handleTopUpRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setTopUpStep('processing');
    
    const txCode = `TOPUP-${Math.floor(Math.random() * 900000 + 100000)}`;
    setTopUpTxCode(txCode);

    const formattedAmount = parseInt(topUpAmount).toLocaleString();
    const webhookUrl = 'https://chat.googleapis.com/v1/spaces/AAQAIxh1Psg/messages?key=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI&token=mmFX7Re00E660oEJ8x90D926rcrIlnwTw7gTLt3Uvu8';

    const message = language === 'en' 
      ? `🚨 *Top Up Request*\n\n*Agent:* ${agent.name} (${agent.id})\n*Amount:* Rp ${formattedAmount}\n*Transaction Code:* \`${txCode}\``
      : `🚨 *Permintaan Top Up*\n\n*Agen:* ${agent.name} (${agent.id})\n*Jumlah:* Rp ${formattedAmount}\n*Kode Transaksi:* \`${txCode}\``;

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: message }),
      });

      if (!response.ok) {
        throw new Error('Failed to send webhook');
      }

      setTopUpStep('success');
    } catch (err) {
      console.error('Top up request error:', err);
      setTopUpStep('error');
    }
  };

  const closeTopUpModal = () => {
    setIsTopUpModalOpen(false);
    setTopUpStep('input');
    setTopUpAmount('');
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{t.dash_title}</h1>
          <p className="text-slate-500 mt-1">{t.dash_subtitle}</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsTopUpModalOpen(true)}
            className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-lg font-semibold hover:bg-slate-50 transition-all shadow-sm"
          >
            <Wallet size={18} className="text-blue-600" />
            {t.dash_req_topup}
          </button>
          <button 
            onClick={() => onNavigate('disbursement')}
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-blue-700 shadow-md shadow-blue-200 transition-all"
          >
            <PlusCircle size={20} />
            {t.dash_new_disb}
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-5">
            <div className={`w-14 h-14 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center`}>
              <stat.icon size={28} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{stat.label}</p>
                {stat.hasInfo && (
                  <div className="group relative">
                    <Info size={14} className="text-slate-400 cursor-help" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-900 text-white text-[10px] rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 text-center font-bold">
                      {stat.infoText}
                    </div>
                  </div>
                )}
              </div>
              <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-1 space-y-6">
          <h2 className="text-lg font-bold text-slate-900">{t.dash_quick_actions}</h2>
          <div className="grid grid-cols-1 gap-4">
            <button 
              onClick={() => onNavigate('manual-entry')}
              className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:border-blue-500 hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                  <CreditCard size={20} />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-slate-900">{t.dash_manual}</p>
                  <p className="text-xs text-slate-500">{t.dash_manual_desc}</p>
                </div>
              </div>
              <ArrowUpRight size={18} className="text-slate-300 group-hover:text-blue-500" />
            </button>

            <button 
              onClick={() => onNavigate('bulk-upload')}
              className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:border-purple-500 hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center">
                  <FileUp size={20} />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-slate-900">{t.dash_bulk}</p>
                  <p className="text-xs text-slate-500">{t.dash_bulk_desc}</p>
                </div>
              </div>
              <ArrowUpRight size={18} className="text-slate-300 group-hover:text-purple-500" />
            </button>

            <button 
              onClick={downloadDisbursementTemplate}
              className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:border-green-500 hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-green-50 text-green-600 rounded-lg flex items-center justify-center">
                  <Download size={20} />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-slate-900">{t.dash_template}</p>
                  <p className="text-xs text-slate-500">{t.dash_template_desc}</p>
                </div>
              </div>
              <ArrowUpRight size={18} className="text-slate-300 group-hover:text-green-500" />
            </button>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">{t.dash_recent_tx}</h2>
            <button 
              onClick={() => onNavigate('history')}
              className="text-blue-600 text-sm font-semibold hover:underline"
            >
              {t.dash_view_all}
            </button>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{t.tbl_date}</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{t.tbl_recipient}</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">{t.tbl_amount}</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">{t.tbl_status}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {RECENT_TRANSACTIONS.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-600 font-medium">{tx.date}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-slate-900">{(tx as any).recipientName || tx.recipient}</span>
                        <span className="text-xs text-slate-500 font-mono">{tx.recipient}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-900 font-bold text-right">Rp {tx.amount.toLocaleString()}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        tx.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Top Up Modal */}
      {isTopUpModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-slate-900/40 backdrop-blur-[2px] animate-fadeIn overflow-y-auto pt-10 md:pt-24"
          onClick={closeTopUpModal}
        >
          <div 
            className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-zoomIn mb-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-black text-slate-900">{t.dash_topup_modal_title}</h3>
              <button onClick={closeTopUpModal} className="p-2 hover:bg-slate-100 rounded-full transition-all">
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              {topUpStep === 'input' && (
                <form onSubmit={handleTopUpRequest} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">{t.dash_topup_amount}</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">Rp</span>
                      <input 
                        type="number" 
                        required
                        autoFocus
                        placeholder="0"
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-xl font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        value={topUpAmount}
                        onChange={(e) => setTopUpAmount(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex gap-3">
                    <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0">
                      <Wallet size={16} />
                    </div>
                    <p className="text-xs text-blue-700 leading-relaxed font-medium">
                      {t.dash_topup_note}
                    </p>
                  </div>
                  <button 
                    type="submit"
                    className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2"
                  >
                    {t.dash_topup_btn}
                  </button>
                </form>
              )}

              {topUpStep === 'processing' && (
                <div className="py-10 flex flex-col items-center justify-center space-y-4">
                  <Loader2 size={48} className="text-blue-600 animate-spin" />
                  <p className="font-bold text-slate-900">{t.dash_wa_redirect}</p>
                </div>
              )}

              {topUpStep === 'error' && (
                <div className="py-6 flex flex-col items-center justify-center space-y-6 text-center">
                  <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
                    <X size={40} />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-xl font-black text-slate-900">{language === 'en' ? 'Request Failed' : 'Permintaan Gagal'}</h4>
                    <p className="text-sm text-slate-500 font-medium px-4">
                      {language === 'en' ? 'Something went wrong while sending your request. Please try again or contact support.' : 'Terjadi kesalahan saat mengirim permintaan Anda. Silakan coba lagi atau hubungi dukungan.'}
                    </p>
                  </div>
                  <button 
                    onClick={() => setTopUpStep('input')}
                    className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-black transition-all"
                  >
                    {language === 'en' ? 'Try Again' : 'Coba Lagi'}
                  </button>
                </div>
              )}

              {topUpStep === 'success' && (
                <div className="py-6 flex flex-col items-center justify-center space-y-6 text-center">
                  <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                    <CheckCircle2 size={40} />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-xl font-black text-slate-900">{t.dash_topup_success_title}</h4>
                    <p className="text-sm text-slate-500 font-medium px-4">
                      {language === 'en' ? 'Your top up request has been sent. Please wait for admin approval.' : 'Permintaan top up Anda telah dikirim. Silakan tunggu persetujuan admin.'}
                    </p>
                  </div>
                  <div className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500 font-bold">{language === 'en' ? 'Transaction Code' : 'Kode Transaksi'}</span>
                      <span className="text-blue-600 font-black font-mono">{topUpTxCode}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500 font-bold">{language === 'en' ? 'Request Amount' : 'Jumlah Permintaan'}</span>
                      <span className="text-slate-900 font-black">Rp {parseInt(topUpAmount).toLocaleString()}</span>
                    </div>
                  </div>
                  <button 
                    onClick={closeTopUpModal}
                    className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-black transition-all"
                  >
                    {t.dash_topup_gotit}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
