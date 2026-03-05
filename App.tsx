
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { DashboardHome } from './components/DashboardHome';
import { DisbursementPage } from './components/DisbursementPage';
import { ManualEntryForm } from './components/ManualEntryForm';
import { BankTransferForm } from './components/BankTransferForm';
import { BulkUploadForm } from './components/BulkUploadForm';
import { TransactionHistory } from './components/TransactionHistory';
import { ActivityLog } from './components/ActivityLog';
import { ScheduledDisbursements } from './components/ScheduledDisbursements';
import { SettingsPage } from './components/SettingsPage';
import { ViewState, User, Language } from './types';
import { MOCK_AGENT } from './constants';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('dashboard');
  const [currentUser, setCurrentUser] = useState<User>(MOCK_AGENT);
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [language, setLanguage] = useState<Language>('en');

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
          <h1 className="text-2xl font-bold mb-4">Welcome to PayStream</h1>
          <p className="text-slate-600 mb-6">Please sign in to access the disbursement system.</p>
          <button 
            onClick={() => setIsAuthenticated(true)}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Mock Sign In
          </button>
        </div>
      </div>
    );
  }

  const renderView = () => {
    switch (view) {
      case 'dashboard':
        return <DashboardHome onNavigate={setView} agent={currentUser} setAgent={setCurrentUser} language={language} />;
      case 'disbursement':
        return <DisbursementPage onNavigate={setView} language={language} />;
      case 'manual-entry':
        return <ManualEntryForm onNavigate={setView} agent={currentUser} setAgent={setCurrentUser} language={language} />;
      case 'bulk-upload':
        return <BulkUploadForm onNavigate={setView} agent={currentUser} setAgent={setCurrentUser} language={language} />;
      case 'bank-transfer':
        return <BankTransferForm onNavigate={setView} agent={currentUser} setAgent={setCurrentUser} language={language} />;
      case 'history':
        return <TransactionHistory language={language} onNavigate={setView} />;
      case 'activity-log':
        return <ActivityLog language={language} />;
      case 'scheduled':
        return <ScheduledDisbursements language={language} />;
      case 'settings':
        return <SettingsPage language={language} setLanguage={setLanguage} />;
      default:
        return <DashboardHome onNavigate={setView} agent={currentUser} setAgent={setCurrentUser} language={language} />;
    }
  };

  return (
    <Layout 
      currentView={view} 
      setView={setView} 
      user={currentUser} 
      onLogout={() => setIsAuthenticated(false)}
      language={language}
    >
      {renderView()}
    </Layout>
  );
};

export default App;
