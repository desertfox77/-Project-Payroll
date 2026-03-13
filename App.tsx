
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
import { LoginPage } from './components/LoginPage';
import { ViewState, User, Language } from './types';
import { MOCK_AGENT } from './constants';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('dashboard');
  const [currentUser, setCurrentUser] = useState<User>(MOCK_AGENT);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [language, setLanguage] = useState<Language>('en');

  if (!isAuthenticated) {
    return <LoginPage onLogin={() => setIsAuthenticated(true)} />;
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
