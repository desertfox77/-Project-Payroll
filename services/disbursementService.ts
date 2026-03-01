import { Disbursement, User, Recipient, BatchSummary } from '../types';
import { RECIPIENTS, LIMITS, DISBURSEMENT_TEMPLATE_CSV, MOCK_AGENT } from '../constants';

export const normalizePhoneNumber = (phone: string): string => {
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('62')) {
    cleaned = '0' + cleaned.substring(2);
  } else if (cleaned.startsWith('8')) {
    cleaned = '0' + cleaned;
  }
  return cleaned;
};

export const downloadDisbursementTemplate = () => {
  const blob = new Blob([DISBURSEMENT_TEMPLATE_CSV], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'disbursement_template.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const validateDisbursement = (
  data: { phoneNumber: string; amount: number; description: string },
  previousAmount: number = 0,
  agent: User = MOCK_AGENT
): Disbursement => {
  const normalized = normalizePhoneNumber(data.phoneNumber);
  const recipient = RECIPIENTS.find(r => r.phoneNumber === normalized);
  
  const disbursement: Disbursement = {
    ...data,
    fee: 0,
    totalDeduction: data.amount,
    status: 'valid',
  };

  if (!recipient) {
    disbursement.status = 'invalid';
    disbursement.error = 'Phone number not registered';
    return disbursement;
  }

  disbursement.recipientName = recipient.name;
  const limit = recipient.registered ? LIMITS.VERIFIED : LIMITS.UNVERIFIED;
  const totalAmount = data.amount + previousAmount;

  if (data.amount > agent.balance) {
    disbursement.status = 'invalid';
    disbursement.error = 'Insufficient balance';
  } else if (recipient.currentBalance + data.amount > limit.MAX_BALANCE) {
    disbursement.status = 'invalid';
    disbursement.error = 'Recipient balance limit exceeded';
  } else if (recipient.monthlyLimitUsed + totalAmount > limit.MONTHLY_TRANSACTION_LIMIT) {
    disbursement.status = 'invalid';
    disbursement.error = 'Recipient monthly transaction limit exceeded';
  }

  return disbursement;
};

export const calculateBatchSummary = (disbursements: Disbursement[]): BatchSummary => {
  const validDisbursements = disbursements.filter(d => d.status === 'valid' || d.status === 'success');
  const totalAmount = validDisbursements.reduce((sum, d) => sum + d.amount, 0);
  const totalFees = validDisbursements.reduce((sum, d) => sum + d.fee, 0);
  const validCount = validDisbursements.length;
  const invalidCount = disbursements.filter(d => d.status === 'invalid' || d.status === 'failed').length;
  
  return {
    totalRecipients: disbursements.length,
    totalAmount,
    totalFees,
    validCount,
    invalidCount
  };
};

export const processTransactions = async (disbursements: Disbursement[]): Promise<Disbursement[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const processed = disbursements.map(d => {
        if (d.status === 'valid') {
          return { ...d, status: 'success' as const };
        }
        return d;
      });
      resolve(processed);
    }, 2000);
  });
};
