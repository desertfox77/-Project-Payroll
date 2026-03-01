
import React from 'react';
import { 
  PlusCircle, 
  UploadCloud, 
  Building2,
  FileSpreadsheet, 
  Download,
  Info,
  ChevronLeft
} from 'lucide-react';
import { ViewState, Language } from '../types';
import { downloadDisbursementTemplate } from '../services/disbursementService';
import { translations } from '../translations';

interface DisbursementPageProps {
  onNavigate: (view: ViewState) => void;
  language: Language;
}

export const DisbursementPage: React.FC<DisbursementPageProps> = ({ onNavigate, language }) => {
  const t = translations[language];

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => onNavigate('dashboard')}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
        >
          <ChevronLeft size={24} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{t.pay_title}</h1>
          <p className="text-slate-500 mt-1">{t.pay_subtitle}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div 
          onClick={() => onNavigate('manual-entry')}
          className="group relative bg-white border-2 border-slate-100 rounded-2xl p-8 cursor-pointer hover:border-blue-500 hover:shadow-xl transition-all"
        >
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <PlusCircle size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">{t.pay_manual_title}</h3>
          <p className="text-slate-500 mb-6 leading-relaxed">
            {t.pay_manual_desc}
          </p>
          <div className="flex items-center text-blue-600 font-bold group-hover:translate-x-1 transition-transform">
            {language === 'en' ? 'Continue' : 'Lanjut'} <ChevronLeft className="rotate-180 ml-2" size={18} />
          </div>
        </div>

        <div 
          onClick={() => onNavigate('bank-transfer')}
          className="group relative bg-white border-2 border-slate-100 rounded-2xl p-8 cursor-pointer hover:border-emerald-500 hover:shadow-xl transition-all"
        >
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <Building2 size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">{t.pay_bank_title}</h3>
          <p className="text-slate-500 mb-6 leading-relaxed">
            {t.pay_bank_desc}
          </p>
          <div className="flex items-center text-emerald-600 font-bold group-hover:translate-x-1 transition-transform">
            {language === 'en' ? 'Transfer to Bank' : 'Transfer ke Bank'} <ChevronLeft className="rotate-180 ml-2" size={18} />
          </div>
        </div>

        <div 
          onClick={() => onNavigate('bulk-upload')}
          className="group relative bg-white border-2 border-slate-100 rounded-2xl p-8 cursor-pointer hover:border-purple-500 hover:shadow-xl transition-all"
        >
          <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <UploadCloud size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">{t.pay_bulk_title}</h3>
          <p className="text-slate-500 mb-6 leading-relaxed">
            {t.pay_bulk_desc}
          </p>
          <div className="flex items-center text-purple-600 font-bold group-hover:translate-x-1 transition-transform">
            {language === 'en' ? 'Upload CSV' : 'Upload CSV'} <ChevronLeft className="rotate-180 ml-2" size={18} />
          </div>
        </div>
      </div>

      <div className="bg-slate-100 border border-slate-200 rounded-2xl p-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-slate-400 shrink-0 shadow-sm">
              <FileSpreadsheet size={24} />
            </div>
            <div>
              <h4 className="font-bold text-slate-900">{t.pay_template_title}</h4>
              <p className="text-slate-500 text-sm mt-1">{t.pay_template_desc}</p>
            </div>
          </div>
          <button 
            onClick={downloadDisbursementTemplate}
            className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-black transition-colors shrink-0"
          >
            <Download size={20} />
            {t.dash_template}
          </button>
        </div>
      </div>

      <div className="flex items-start gap-3 p-4 bg-blue-50 text-blue-700 rounded-xl border border-blue-100">
        <Info size={20} className="shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-bold">{t.pay_note_title}</p>
          <p className="mt-1 opacity-90">{t.pay_note_desc}</p>
        </div>
      </div>
    </div>
  );
};
