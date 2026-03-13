
import React, { useState, useRef, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Wallet, 
  History, 
  Settings, 
  LogOut, 
  Bell, 
  Menu,
  ChevronRight,
  UserCircle,
  X,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  FileClock,
  Building2
} from 'lucide-react';
import { ViewState, User, Language } from '../types';
import { translations } from '../translations';

interface LayoutProps {
  children: React.ReactNode;
  currentView: ViewState;
  setView: (view: ViewState) => void;
  user: User;
  onLogout: () => void;
  language: Language;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'success' | 'warning' | 'info';
  isRead: boolean;
  relatedView?: ViewState;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'n1',
    title: 'Batch Disbursement Success',
    message: 'Batch #BT-90210 containing 124 records has been processed successfully.',
    time: '2m ago',
    type: 'success',
    isRead: false,
    relatedView: 'history'
  },
  {
    id: 'n2',
    title: 'Low Balance Alert',
    message: 'Your agent balance is below Rp 5,000,000. Please top up to avoid disbursement failures.',
    time: '1h ago',
    type: 'warning',
    isRead: false,
    relatedView: 'dashboard'
  }
];

export const Layout: React.FC<LayoutProps> = ({ children, currentView, setView, user, onLogout, language }) => {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const notificationRef = useRef<HTMLDivElement>(null);
  const t = translations[language];

  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    { id: 'dashboard', label: t.nav_dashboard, icon: LayoutDashboard },
    { id: 'disbursement', label: t.nav_disbursement, icon: Wallet },
    { id: 'bank-transfer', label: t.nav_bank_transfer, icon: Building2 },
    { id: 'scheduled', label: t.nav_scheduled, icon: FileClock },
    { id: 'history', label: t.nav_history, icon: History },
    { id: 'activity-log', label: t.nav_activity, icon: Clock },
    { id: 'settings', label: t.nav_settings, icon: Settings },
  ];

  const handleNotificationClick = (notif: Notification) => {
    // Mark as read
    setNotifications(notifications.map(n => 
      n.id === notif.id ? { ...n, isRead: true } : n
    ));
    
    // Redirect if related view exists
    if (notif.relatedView) {
      setView(notif.relatedView);
      setIsNotificationsOpen(false);
    }
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success': return <CheckCircle2 size={18} className="text-green-500" />;
      case 'warning': return <AlertTriangle size={18} className="text-amber-500" />;
      case 'info': return <Info size={18} className="text-blue-500" />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col hidden md:flex shrink-0">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold">P</div>
          <span className="text-xl font-bold text-white tracking-tight">PayStream</span>
        </div>
        
        <nav className="flex-1 px-4 mt-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id as ViewState)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                currentView === item.id || (item.id === 'disbursement' && (currentView === 'manual-entry' || currentView === 'bulk-upload'))
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                  : 'hover:bg-slate-800'
              }`}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-900/20 hover:text-red-400 transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">{t.nav_logout}</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Navbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 relative z-40">
          <div className="flex items-center gap-4">
            <button className="md:hidden text-slate-500">
              <Menu size={24} />
            </button>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative" ref={notificationRef}>
              <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className={`relative p-2 rounded-full transition-all ${
                  isNotificationsOpen ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                <Bell size={22} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-black flex items-center justify-center rounded-full ring-2 ring-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {isNotificationsOpen && (
                <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden animate-fadeInUp">
                  <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <h3 className="font-black text-slate-900">Notifications</h3>
                    <button 
                      onClick={markAllAsRead}
                      className="text-xs font-bold text-blue-600 hover:underline"
                    >
                      Mark all as read
                    </button>
                  </div>
                  
                  <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                    {notifications.length > 0 ? (
                      <div className="divide-y divide-slate-100">
                        {notifications.map((notif) => (
                          <div 
                            key={notif.id} 
                            onClick={() => handleNotificationClick(notif)}
                            className={`p-5 flex gap-4 hover:bg-slate-50 transition-colors cursor-pointer group ${!notif.isRead ? 'bg-blue-50/30' : ''}`}
                          >
                            <div className="shrink-0 pt-1">
                              {getNotificationIcon(notif.type)}
                            </div>
                            <div className="flex-1 space-y-1">
                              <div className="flex justify-between items-start gap-2">
                                <h4 className={`text-sm font-bold ${notif.isRead ? 'text-slate-700' : 'text-slate-900'}`}>
                                  {notif.title}
                                </h4>
                                {!notif.isRead && <div className="w-2 h-2 bg-blue-600 rounded-full shrink-0 mt-1.5"></div>}
                              </div>
                              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                                {notif.message}
                              </p>
                              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-wider pt-1">
                                <Clock size={10} />
                                {notif.time}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-10 text-center flex flex-col items-center justify-center space-y-3">
                        <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                          <Bell size={24} />
                        </div>
                        <p className="text-sm font-medium text-slate-400">No new notifications</p>
                      </div>
                    )}
                  </div>

                  <div className="p-3 bg-slate-50 border-t border-slate-100">
                    <button 
                      onClick={() => { setView('activity-log'); setIsNotificationsOpen(false); }}
                      className="w-full py-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors flex items-center justify-center gap-2"
                    >
                      {t.nav_all_activities}
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-black text-slate-900">{user.name}</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Agent ID: {user.id}</p>
              </div>
              <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 border border-slate-200">
                <UserCircle size={24} />
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <main className="flex-1 overflow-y-auto custom-scrollbar p-6">
          <div className="max-w-6xl mx-auto animate-fadeIn">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
