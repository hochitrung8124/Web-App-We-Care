export interface Lead {
  id: string;
  name: string;
  subInfo: string;
  initials: string;
  phone: string;
  email: string;
  address: string;
  source: string;
  campaign: string;
  status: 'Waiting' | 'Processed' | 'Cancelled';
  taxCode: string;
  avatarColorClass: string;
  
  // New fields
  birthDate?: string;
  detailedIndustry?: string;
  district: string;
  city: string;
  paymentTerms?: string;
  tradeName: string;
  supervisor: string;
  salesStaff?: string;
  debtStaff?: string;
  initialPotential?: string;
  initialGeneralInfo?: string;
  repDescription?: string;
  keyIndustry?: string;
  subIndustry?: string;
}

export type ConsultationResult = 'high_interest' | 'no_answer' | 'wrong_number' | 'call_back';
