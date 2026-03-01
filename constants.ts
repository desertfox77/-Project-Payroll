
import { Recipient, User, Activity, ScheduledBatch } from './types';

export const MOCK_AGENT: User = {
  id: 'AG-12345',
  name: 'Global Corp Disbursement',
  role: 'agent',
  balance: 1000000.00
};

export const RECIPIENTS: Recipient[] = [
  { phoneNumber: '081519866374', name: 'Soekarno', registered: true, currentBalance: 500000, monthlyLimitUsed: 1000000 },
  { phoneNumber: '081812341230', name: 'Suharto', registered: true, currentBalance: 750000, monthlyLimitUsed: 2000000 },
  { phoneNumber: '081234567890', name: 'Bacharuddin', registered: false, currentBalance: 1500000, monthlyLimitUsed: 2000000 },
  { phoneNumber: '089765432134', name: 'Abdurrahman', registered: false, currentBalance: 200000, monthlyLimitUsed: 1500000 },
  { phoneNumber: '081122334457', name: 'Megawati', registered: true, currentBalance: 5000000, monthlyLimitUsed: 40000000 },
  { phoneNumber: '085566778898', name: 'Susilo', registered: false, currentBalance: 1200000, monthlyLimitUsed: 20000000 },
];

export const MOCK_SCHEDULED_BATCHES: ScheduledBatch[] = [
  {
    id: 'SCH-001',
    fileName: 'salary_batch_feb.csv',
    totalRecipients: 150,
    totalAmount: 75000000,
    scheduledTime: '2026-02-28 09:00',
    createdAt: '2026-02-23 10:00',
    status: 'scheduled'
  },
  {
    id: 'SCH-002',
    fileName: 'bonus_payout.csv',
    totalRecipients: 45,
    totalAmount: 22500000,
    scheduledTime: '2026-03-01 14:30',
    createdAt: '2026-02-22 15:45',
    status: 'scheduled'
  }
];

export const BANK_LIST = [
  "Allo Bank Indonesia",
  "BPD Banten",
  "BPD Nusa Tenggara Barat",
  "BPD Nusa Tenggara Timur",
  "BTPN Syariah",
  "Bank ANZ Indonesia",
  "Bank Aladin Syariah",
  "Bank Amar Indonesia",
  "Bank Artha Graha International",
  "Bank BJB",
  "Bank BJB Syariah",
  "Bank BNP Paribas",
  "Bank Bisnis Internasional",
  "Bank Bukopin",
  "Bank Bumi Arta",
  "Bank CIMB Niaga",
  "Bank CIMB Niaga Syariah",
  "Bank Capital Indonesia",
  "Bank Central Asia (BCA)",
  "Bank Central Asia Digital",
  "Bank Central Asia Syariah",
  "Bank Chinatrust Indonesia",
  "Bank Commonwealth",
  "Bank DBS Indonesia",
  "Bank DKI",
  "Bank DKI Syariah",
  "Bank Danamon",
  "Bank Danamon Syariah",
  "Bank Ganesha",
  "Bank Hana",
  "Bank IBK Indonesia",
  "Bank ICBC Indonesia",
  "Bank Ina Perdania",
  "Bank Index Selindo",
  "Bank JTrust Indonesia",
  "Bank Jago",
  "Bank Jasa Jakarta",
  "Bank MNC Internasional",
  "Bank Mandiri",
  "Bank Maspion Indonesia",
  "Bank Mayapada Internasional",
  "Bank Mayora",
  "Bank Mega",
  "Bank Mestika Dharma",
  "Bank Mizuho indonesia",
  "Bank Muamalat Indonesia",
  "Bank Multi Arta Sentosa",
  "Bank Nationalnobu",
  "Bank Negara Indonesia (BNI)",
  "Bank Neo Commerce",
  "Bank OCBC NISP",
  "Bank OCBC NISP Syariah",
  "Bank Oke Indonesia",
  "Bank Panin",
  "Bank Panin Syariah",
  "Bank Pembangunan Daerah Aceh Syariah",
  "Bank Pembangunan Daerah Daerah Istimewa Yogyakarta",
  "Bank Pembangunan Daerah Daerah Istimewa Yogyakarta Syariah",
  "Bank Pembangunan Daerah Jambi Syariah",
  "Bank Pembangunan Daerah Jawa Tengah"
];

export const TRANSACTION_FEE = 0.00;
export const BANK_TRANSFER_FEE = 10000;

export const LIMITS = {
  VERIFIED: {
    MAX_BALANCE: 20000000,
    MONTHLY_TRANSACTION_LIMIT: 40000000,
  },
  UNVERIFIED: {
    MAX_BALANCE: 2000000,
    MONTHLY_TRANSACTION_LIMIT: 20000000,
  }
};

export const MOCK_ACTIVITIES: Activity[] = ([
  { id: 'ACT-101', type: 'disbursement', title: 'Disbursement', description: 'October Salary', date: '2023-10-25 10:30', recipient: '081519866374', recipientName: 'Soekarno', amount: 1500000, status: 'Completed' },
  { id: 'ACT-107', type: 'disbursement', title: 'Bank Transfer', description: 'BCA Transfer', date: '2026-02-24 09:15', recipient: '0661180128', recipientName: 'Leonardus Wiliem /A', bankName: 'Bank Central Asia (BCA)', amount: 2500000, status: 'Completed' },
  { id: 'ACT-102', type: 'topup', title: 'Top-Up Request', description: 'Balance top up request sent to CorpFin', date: '2023-10-25 09:15', amount: 5000000, status: 'Pending' },
  { id: 'ACT-103', type: 'disbursement', title: 'Individual Disbursement', description: 'Transport Allowance', date: '2023-10-24 14:15', recipient: '081812341230', recipientName: 'Suharto', amount: 200000, status: 'Completed' },
  { id: 'ACT-105', type: 'disbursement', title: 'Disbursement', description: 'Bonus Payment', date: '2023-10-24 09:00', recipient: '081234567890', recipientName: 'Bacharuddin', amount: 5000000, status: 'Failed' },
  { id: 'ACT-106', type: 'topup', title: 'Top-Up Completed', description: 'Balance top up approved', date: '2023-10-23 18:30', amount: 2000000, status: 'Completed' },
] as Activity[]).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

export const RECENT_TRANSACTIONS = [
  { id: 'TX-5', date: '2026-02-24 09:15', recipient: '0661180128', recipientName: 'Leonardus Wiliem /A', amount: 2500000, status: 'Completed' },
  { id: 'TX-1', date: '2023-10-25 10:30', recipient: '081519866374', recipientName: 'Soekarno', amount: 1500000, status: 'Completed' },
  { id: 'TX-2', date: '2023-10-24 14:15', recipient: '081812341230', recipientName: 'Suharto', amount: 200000, status: 'Completed' },
  { id: 'TX-3', date: '2023-10-24 09:00', recipient: '081234567890', recipientName: 'Bacharuddin', amount: 5000000, status: 'Failed' },
  { id: 'TX-4', date: '2023-10-23 16:45', recipient: '081122334457', recipientName: 'Megawati', amount: 1200000, status: 'Completed' },
];

export const DISBURSEMENT_TEMPLATE_CSV = `Phone Number,Amount,Description
081519866374,500000,
081812341230,1000000,note`;
