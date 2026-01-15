import { getProspectiveCustomerService } from './index';

export interface PhoneCheckResult {
  exists: boolean;
  customerId?: string;
  customerName?: string;
}

export interface TaxCodeCheckResult {
  exists: boolean;
  customerId?: string;
  customerName?: string;
}

/**
 * Kiểm tra số điện thoại đã tồn tại trong hệ thống chưa
 */
export const checkPhoneExists = async (phone: string): Promise<PhoneCheckResult> => {
  try {
    const cleanPhone = phone.replace(/\s/g, '').trim();
    
    const customerService = getProspectiveCustomerService();
    
    // Lấy tất cả leads và filter theo phone
    const allLeads = await customerService.getProspectiveCustomers(1000);
    const existingLead = allLeads.find(lead => 
      lead.phone.replace(/\s/g, '').trim() === cleanPhone
    );
    
    if (existingLead) {
      return {
        exists: true,
        customerId: existingLead.id,
        customerName: existingLead.name,
      };
    }
    
    return {
      exists: false,
    };
  } catch (error) {
    console.error('Error checking phone:', error);
    // Nếu có lỗi khi check, cho phép tiếp tục (không block)
    return {
      exists: false,
    };
  }
};

/**
 * Kiểm tra mã số thuế đã tồn tại trong hệ thống chưa
 */
export const checkTaxCodeExists = async (taxCode: string): Promise<TaxCodeCheckResult> => {
  try {
    const cleanTaxCode = taxCode.replace(/\s/g, '').trim();
    
    // Bỏ qua nếu MST rỗng
    if (!cleanTaxCode) {
      return { exists: false };
    }
    
    const customerService = getProspectiveCustomerService();
    
    // Lấy tất cả leads và filter theo taxCode
    const allLeads = await customerService.getProspectiveCustomers(1000);
    const existingLead = allLeads.find(lead => 
      lead.taxCode && lead.taxCode.replace(/\s/g, '').trim() === cleanTaxCode
    );
    
    if (existingLead) {
      return {
        exists: true,
        customerId: existingLead.id,
        customerName: existingLead.name,
      };
    }
    
    return {
      exists: false,
    };
  } catch (error) {
    console.error('Error checking tax code:', error);
    // Nếu có lỗi khi check, cho phép tiếp tục (không block)
    return {
      exists: false,
    };
  }
};
