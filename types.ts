
export interface User {
  id: string;
  name: string;
  role: 'agent' | 'admin';
  balance: number;
}

export interface Recipient {
  phoneNumber: string;
  name: string;
  registered: boolean;
  currentBalance: number;
  monthlyLimitUsed: number;
}

export interface Disbursement {
  phoneNumber: string;
  recipientName?: string;
  amount: number;
  description: string;
  fee: number;
  totalDeduction: number;
  status: 'pending' | 'valid' | 'invalid' | 'success' | 'failed';
  error?: string;
}

export interface Activity {
  id: string;
  type: 'disbursement' | 'topup' | 'system';
  title: string;
  description: string;
  date: string;
  amount?: number;
  status: 'Completed' | 'Pending' | 'Failed';
  recipient?: string;
  recipientName?: string;
  bankName?: string;
  recipients?: {
    name: string;
    phone: string;
    amount: number;
    status: string;
  }[];
}

export interface BatchSummary {
  totalRecipients: number;
  totalAmount: number;
  totalFees: number;
  validCount: number;
  invalidCount: number;
}

export interface ScheduledBatch {
  id: string;
  fileName: string;
  totalRecipients: number;
  totalAmount: number;
  scheduledTime: string;
  createdAt: string;
  status: 'scheduled' | 'cancelled' | 'processing' | 'completed';
}

export type Language = 'en' | 'id';

export type ViewState = 'dashboard' | 'disbursement' | 'manual-entry' | 'bulk-upload' | 'bank-transfer' | 'history' | 'activity-log' | 'scheduled' | 'settings';
