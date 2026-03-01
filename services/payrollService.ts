import { RECIPIENTS } from '../constants';
import { Recipient, Disbursement, User } from '../types';
import { validateDisbursement as validate, normalizePhoneNumber } from './disbursementService';

export const findRecipient = (phoneNumber: string): Recipient | undefined => {
  const searchPhone = normalizePhoneNumber(phoneNumber);
  return RECIPIENTS.find(r => r.phoneNumber === searchPhone);
};

export const validateDisbursement = validate;
