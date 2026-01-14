/**
 * Customer Service
 * CRUD operations for Customers table (crdfd_customers)
 * Mapping các fields từ form sang Dataverse
 */

import { AppConfig } from '../config/app.config';
import { getToken } from '../implicitAuthService';
import { Lead } from '../types';

const BASE_URL = AppConfig.dataverse.baseUrl;

/**
 * Get authorization headers
 */
async function getHeaders(): Promise<HeadersInit> {
    const token = await getToken();
    return {
        'Authorization': `Bearer ${token}`,
        'OData-MaxVersion': '4.0',
        'OData-Version': '4.0',
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Prefer': 'return=representation'
    };
}

// WeCare GUID trong bảng cr1bb_congty
const WECARE_COMPANY_GUID = '8f603736-b718-ef11-840a-000d3aa00fac';

/**
 * Mapping Lead (form) -> Dataverse Customer fields
 * Dựa trên Customers.json NativeCDSDataSourceInfoNameMapping
 */
function mapLeadToCustomer(lead: Lead): Record<string, any> {
    const customerData: Record<string, any> = {};

    // Thông tin cơ bản - đảm bảo luôn là string
    if (lead.name) customerData['crdfd_name'] = String(lead.name);                          // Customer name
    if (lead.phone) customerData['cr44a_st'] = String(lead.phone);                          // Điện thoại
    if (lead.taxCode) customerData['crdfd_mst'] = String(lead.taxCode);                     // MST
    if (lead.address) customerData['crdfd_address'] = String(lead.address);                 // Địa chỉ
    if (lead.birthDate) customerData['crdfd_ngay_sinh'] = String(lead.birthDate);           // Ngày sinh

    // Loại cửa hàng (text field) - đảm bảo luôn là string
    if (lead.loaiCuaHang) customerData['cr1bb_loaicuahangtext'] = String(lead.loaiCuaHang); // Loại cửa hàng text

    // Vị trí - Quận huyện, Tỉnh thành (sẽ cần lookup ID nếu là relationship)
    // Tạm thời dùng CAL/text fields - đảm bảo luôn là string
    if (lead.district) customerData['crdfd_quanhuyencal'] = String(lead.district);          // Quận huyện CAL
    if (lead.city) customerData['cr1bb_tinhthanh'] = String(lead.city);                     // Tỉnh/thành CAL

    // Ngành nghề & Thương mại - đảm bảo luôn là string
    if (lead.detailedIndustry) customerData['crdfd_nganhnghetext'] = String(lead.detailedIndustry);  // Ngành nghề text

    // Tên thương mại - Lookup đến bảng cr1bb_congty (WeCare cố định)
    // Sử dụng @odata.bind để set lookup reference
    // EntitySetName là "cr1bb_congties" (có "ies" ở cuối)
    customerData['crdfd_Tenthuongmai@odata.bind'] = `/cr1bb_congties(${WECARE_COMPANY_GUID})`;

    // Ngành chủ lực - OptionSet yêu cầu số nguyên
    if (lead.keyIndustry) {
      const keyIndustryValue = typeof lead.keyIndustry === 'string' 
        ? parseInt(lead.keyIndustry, 10) 
        : lead.keyIndustry;
      if (!isNaN(keyIndustryValue)) {
        customerData['cr1bb_nganhchuluc'] = keyIndustryValue;
      }
    }
    // Ngành phụ - CÓ THỂ là text field, đảm bảo luôn là string
    // Nếu API yêu cầu số, sẽ cần kiểm tra lại metadata
    if (lead.subIndustry) {
      // Thử gửi string trước (vì lỗi API nói cần Edm.String)
      customerData['cr1bb_nganhphu'] = String(lead.subIndustry);
    }
    // Điều khoản thanh toán - Text field yêu cầu string (label)
    if (lead.paymentTerms) {
      customerData['crdfd_ieukhoanthanhtoan'] = String(lead.paymentTerms);
    }

    // Nhân sự phụ trách - đảm bảo luôn là string
    if (lead.supervisor) customerData['crdfd_supervisormail'] = String(lead.supervisor);    // Supervisor - mail (text)
    if (lead.salesStaff) customerData['cr1bb_nhanviensaletext'] = String(lead.salesStaff);  // Nhân viên sale (text)
    if (lead.debtStaff) customerData['cr1bb_nhanviencongnotext'] = String(lead.debtStaff);  // Nhân viên công nợ (text)

    // Đánh giá ban đầu
    // Tiềm năng ban đầu - OptionSet yêu cầu số nguyên
    if (lead.initialPotential) {
      const initialPotentialValue = typeof lead.initialPotential === 'string' 
        ? parseInt(lead.initialPotential, 10) 
        : lead.initialPotential;
      if (!isNaN(initialPotentialValue)) {
        customerData['cr1bb_tiemnangbanau'] = initialPotentialValue;
      }
    }
    // Các trường text - đảm bảo luôn là string
    if (lead.initialGeneralInfo) customerData['cr1bb_thongtinchungbanau'] = String(lead.initialGeneralInfo); // Thông tin chung ban đầu
    if (lead.repDescription) customerData['cr1bb_motanguoiaidien'] = String(lead.repDescription); // Mô tả người đại diện

    return customerData;
}

/**
 * Create new Customer in Dataverse
 */
export async function createCustomer(lead: Lead): Promise<string> {
    try {
        const customerData = mapLeadToCustomer(lead);

        // Debug: Kiểm tra TẤT CẢ các trường có đang chứa số không (bao gồm cả các trường khác)
        console.log('🔍 Debugging payload before sending:');
        for (const [key, value] of Object.entries(customerData)) {
            if (typeof value === 'number') {
                console.warn(`⚠️ Field "${key}" has value ${value} (type: number)`);
                // Nếu là trường text nhưng có giá trị số, chuyển thành string
                const textFields = ['cr1bb_loaicuahangtext', 'crdfd_quanhuyencal', 'cr1bb_tinhthanh', 'crdfd_nganhnghetext', 
                                   'crdfd_supervisormail', 'cr1bb_nhanviensaletext', 'cr1bb_nhanviencongnotext',
                                   'cr1bb_thongtinchungbanau', 'cr1bb_motanguoiaidien', 'crdfd_name', 'cr44a_st', 
                                   'crdfd_mst', 'crdfd_address', 'crdfd_ngay_sinh'];
                if (textFields.includes(key)) {
                    console.error(`❌ ERROR: Text field "${key}" contains number ${value}! Converting to string...`);
                    customerData[key] = String(value);
                }
            }
        }

        console.log('🔄 Creating customer in Dataverse:', JSON.stringify(customerData, null, 2));

        const response = await fetch(`${BASE_URL}/crdfd_customers`, {
            method: 'POST',
            headers: await getHeaders(),
            body: JSON.stringify(customerData)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Create Error:', response.status, errorText);
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const result = await response.json();
        const customerId = result.crdfd_customerid;

        console.log('✅ Customer created with ID:', customerId);
        return customerId;
    } catch (error) {
        console.error('❌ Error creating customer:', error);
        throw error;
    }
}

/**
 * Update existing Customer in Dataverse
 */
export async function updateCustomer(customerId: string, lead: Lead): Promise<void> {
    try {
        const customerData = mapLeadToCustomer(lead);

        // Debug: Kiểm tra TẤT CẢ các trường có đang chứa số không (bao gồm cả các trường khác)
        console.log('🔍 Debugging payload before sending:');
        for (const [key, value] of Object.entries(customerData)) {
            if (typeof value === 'number') {
                console.warn(`⚠️ Field "${key}" has value ${value} (type: number)`);
                // Nếu là trường text nhưng có giá trị số, chuyển thành string
                const textFields = ['cr1bb_loaicuahangtext', 'crdfd_quanhuyencal', 'cr1bb_tinhthanh', 'crdfd_nganhnghetext', 
                                   'crdfd_supervisormail', 'cr1bb_nhanviensaletext', 'cr1bb_nhanviencongnotext',
                                   'cr1bb_thongtinchungbanau', 'cr1bb_motanguoiaidien', 'crdfd_name', 'cr44a_st', 
                                   'crdfd_mst', 'crdfd_address', 'crdfd_ngay_sinh'];
                if (textFields.includes(key)) {
                    console.error(`❌ ERROR: Text field "${key}" contains number ${value}! Converting to string...`);
                    customerData[key] = String(value);
                }
            }
        }

        console.log('🔄 Updating customer in Dataverse:', customerId, JSON.stringify(customerData, null, 2));

        const response = await fetch(`${BASE_URL}/crdfd_customers(${customerId})`, {
            method: 'PATCH',
            headers: await getHeaders(),
            body: JSON.stringify(customerData)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Update Error:', response.status, errorText);
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        console.log('✅ Customer updated successfully');
    } catch (error) {
        console.error('❌ Error updating customer:', error);
        throw error;
    }
}

/**
 * Get Customer by ID
 */
export async function getCustomerById(customerId: string): Promise<Lead | null> {
    try {
        const response = await fetch(`${BASE_URL}/crdfd_customers(${customerId})?$select=crdfd_customerid,crdfd_name,cr44a_st,crdfd_mst,crdfd_address,crdfd_ngay_sinh,cr1bb_loaicuahangtext,crdfd_quanhuyencal,cr1bb_tinhthanh,crdfd_nganhnghetext,crdfd_Tenthuongmai,cr1bb_nganhchuluc,cr1bb_nganhphu,crdfd_ieukhoanthanhtoan,crdfd_supervisormail,cr1bb_nhanviensaletext,cr1bb_nhanviencongnotext,cr1bb_tiemnangbanau,cr1bb_thongtinchungbanau,cr1bb_motanguoiaidien`, {
            method: 'GET',
            headers: await getHeaders()
        });

        if (!response.ok) {
            if (response.status === 404) return null;
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        // Map back to Lead
        // Chuyển đổi OptionSet values (số) thành string để match với form select
        // Đảm bảo tất cả các trường text đều là string (không phải số)
        return {
            id: data.crdfd_customerid,
            name: data.crdfd_name || '',
            phone: data.cr44a_st || '',
            taxCode: data.crdfd_mst || '',
            address: data.crdfd_address || '',
            birthDate: data.crdfd_ngay_sinh || '',
            // Các trường text - đảm bảo luôn là string (có thể API trả về số)
            loaiCuaHang: data.cr1bb_loaicuahangtext != null ? String(data.cr1bb_loaicuahangtext) : '',
            district: data.crdfd_quanhuyencal != null ? String(data.crdfd_quanhuyencal) : '',
            city: data.cr1bb_tinhthanh != null ? String(data.cr1bb_tinhthanh) : '',
            detailedIndustry: data.crdfd_nganhnghetext != null ? String(data.crdfd_nganhnghetext) : '',
            tradeName: data.crdfd_Tenthuongmai || 'WeShop',
            // OptionSet values từ API là số, chuyển thành string để match với form
            keyIndustry: data.cr1bb_nganhchuluc != null ? String(data.cr1bb_nganhchuluc) : '',
            subIndustry: data.cr1bb_nganhphu != null ? String(data.cr1bb_nganhphu) : '',
            paymentTerms: data.crdfd_ieukhoanthanhtoan != null ? String(data.crdfd_ieukhoanthanhtoan) : '',
            supervisor: data.crdfd_supervisormail != null ? String(data.crdfd_supervisormail) : '',
            salesStaff: data.cr1bb_nhanviensaletext != null ? String(data.cr1bb_nhanviensaletext) : '',
            debtStaff: data.cr1bb_nhanviencongnotext != null ? String(data.cr1bb_nhanviencongnotext) : '',
            initialPotential: data.cr1bb_tiemnangbanau != null ? String(data.cr1bb_tiemnangbanau) : '',
            initialGeneralInfo: data.cr1bb_thongtinchungbanau != null ? String(data.cr1bb_thongtinchungbanau) : '',
            repDescription: data.cr1bb_motanguoiaidien != null ? String(data.cr1bb_motanguoiaidien) : '',
            status: 'Mới',
            source: 'Web',
            initials: (data.crdfd_name || 'KH').substring(0, 2).toUpperCase(),
            avatarColorClass: 'bg-blue-100 text-blue-600'
        } as Lead;
    } catch (error) {
        console.error('❌ Error getting customer:', error);
        return null;
    }
}

/**
 * Save customer (create or update based on ID)
 */
export async function saveCustomer(lead: Lead): Promise<string> {
    // Check if this is an existing customer (has valid GUID ID)
    const isNewCustomer = !lead.id || lead.id.length < 30; // GUIDs are 36 chars

    if (isNewCustomer) {
        return createCustomer(lead);
    } else {
        await updateCustomer(lead.id, lead);
        return lead.id;
    }
}
