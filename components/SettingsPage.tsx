
import React from 'react';
import { 
  Settings as SettingsIcon, 
  Globe, 
  Check, 
  Shield, 
  Bell, 
  User as UserIcon,
  ChevronRight
} from 'lucide-react';
import { Language } from '../types';
import { translations } from '../translations';

interface SettingsPageProps {
  language: Language;
  setLanguage: (lang: Language) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ language, setLanguage }) => {
  const t = translations[language];
  const languages = [
    { id: 'en', name: 'English', label: 'Default' },
    { id: 'id', name: 'Bahasa Indonesia', label: '' },
  ];

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{t.sett_title}</h1>
        <p className="text-slate-500 mt-1">{t.sett_subtitle}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-2">
          <button className="w-full flex items-center justify-between p-4 bg-white border border-blue-200 rounded-xl text-blue-600 font-bold shadow-sm transition-all">
            <div className="flex items-center gap-3">
              <Globe size={18} />
              <span>{language === 'en' ? 'Language' : 'Bahasa'}</span>
            </div>
            <ChevronRight size={16} />
          </button>
          <button className="w-full flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl text-slate-600 font-bold hover:bg-slate-50 transition-all">
            <div className="flex items-center gap-3">
              <UserIcon size={18} />
              <span>{t.sett_profile}</span>
            </div>
            <ChevronRight size={16} />
          </button>
          <button className="w-full flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl text-slate-600 font-bold hover:bg-slate-50 transition-all">
            <div className="flex items-center gap-3">
              <Bell size={18} />
              <span>{t.sett_notif}</span>
            </div>
            <ChevronRight size={16} />
          </button>
          <button className="w-full flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl text-slate-600 font-bold hover:bg-slate-50 transition-all">
            <div className="flex items-center gap-3">
              <Shield size={18} />
              <span>{t.sett_security}</span>
            </div>
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-black text-slate-900 flex items-center gap-2">
                <Globe size={18} className="text-blue-600" />
                {t.sett_lang_title}
              </h3>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">{t.sett_lang_subtitle}</p>
            </div>
            
            <div className="p-6 space-y-3">
              {languages.map((lang) => (
                <button
                  key={lang.id}
                  onClick={() => setLanguage(lang.id as Language)}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                    language === lang.id 
                      ? 'border-blue-600 bg-blue-50/50 shadow-sm' 
                      : 'border-slate-100 hover:border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex flex-col items-start">
                    <span className={`font-bold ${language === lang.id ? 'text-blue-900' : 'text-slate-700'}`}>
                      {lang.name}
                    </span>
                    {lang.label && (
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 mt-0.5">
                        {lang.label}
                      </span>
                    )}
                  </div>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                    language === lang.id ? 'bg-blue-600 text-white scale-110' : 'bg-slate-100 text-transparent'
                  }`}>
                    <Check size={14} strokeWidth={4} />
                  </div>
                </button>
              ))}
            </div>

            <div className="p-6 bg-blue-50/30 border-t border-slate-100">
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0">
                  <Globe size={16} />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-blue-900">{t.sett_lang_curr}: {languages.find(l => l.id === language)?.name}</p>
                  <p className="text-xs text-blue-700/80 leading-relaxed">
                    {language === 'en' 
                      ? 'Changing the language will update the labels, navigation menus, and system messages throughout the application.' 
                      : 'Mengubah bahasa akan memperbarui label, menu navigasi, dan pesan sistem di seluruh aplikasi.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
