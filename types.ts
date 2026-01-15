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
  status: string;
  statusCode?: number; // Added for precise filtering
  taxCode: string;
  avatarColorClass: string;

  // New fields
  birthDate?: string;
  detailedIndustry?: string; // OptionSet value (số)
  detailedIndustryText?: string; // Label text cho display và logic mapping
  district: string; // Tên quận/huyện (for display)
  districtId?: string; // GUID của lookup crdfd_quanhuyen
  city: string; // Tên tỉnh/thành (for display)
  cityId?: string; // GUID của lookup crdfd_tinhthanh
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
  loaiCuaHang?: string; // Loại cửa hàng
}

export type ConsultationResult = 'high_interest' | 'no_answer' | 'wrong_number' | 'call_back';
