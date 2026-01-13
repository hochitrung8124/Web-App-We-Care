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

/**
 * Mapping Lead (form) -> Dataverse Customer fields
 * Dựa trên Customers.json NativeCDSDataSourceInfoNameMapping
 */
function mapLeadToCustomer(lead: Lead): Record<string, any> {
    const customerData: Record<string, any> = {};

    // Thông tin cơ bản
    if (lead.name) customerData['crdfd_name'] = lead.name;                          // Customer name
    if (lead.phone) customerData['cr44a_st'] = lead.phone;                          // Điện thoại
    if (lead.taxCode) customerData['crdfd_mst'] = lead.taxCode;                     // MST
    if (lead.address) customerData['crdfd_address'] = lead.address;                 // Địa chỉ
    if (lead.birthDate) customerData['crdfd_ngay_sinh'] = lead.birthDate;           // Ngày sinh

    // Loại cửa hàng (text field)
    if (lead.loaiCuaHang) customerData['cr1bb_loaicuahangtext'] = lead.loaiCuaHang; // Loại cửa hàng text

    // Vị trí - Quận huyện, Tỉnh thành (sẽ cần lookup ID nếu là relationship)
    // Tạm thời dùng CAL/text fields
    if (lead.district) customerData['crdfd_quanhuyencal'] = lead.district;          // Quận huyện CAL
    if (lead.city) customerData['cr1bb_tinhthanh'] = lead.city;                     // Tỉnh/thành CAL

    // Ngành nghề & Thương mại
    if (lead.detailedIndustry) customerData['crdfd_nganhnghetext'] = lead.detailedIndustry;  // Ngành nghề text
    if (lead.tradeName) customerData['crdfd_Tenthuongmai'] = lead.tradeName;        // Tên thương mại (lookup)
    if (lead.keyIndustry) customerData['cr1bb_nganhchuluc'] = lead.keyIndustry;     // Ngành chủ lực
    if (lead.subIndustry) customerData['cr1bb_nganhphu'] = lead.subIndustry;        // Ngành phụ
    if (lead.paymentTerms) customerData['crdfd_ieukhoanthanhtoan'] = lead.paymentTerms; // Điều khoản thanh toán text

    // Nhân sự phụ trách
    if (lead.supervisor) customerData['crdfd_supervisormail'] = lead.supervisor;    // Supervisor - mail (text)
    if (lead.salesStaff) customerData['cr1bb_nhanviensaletext'] = lead.salesStaff;  // Nhân viên sale (text)
    if (lead.debtStaff) customerData['cr1bb_nhanviencongnotext'] = lead.debtStaff;  // Nhân viên công nợ (text)

    // Đánh giá ban đầu
    if (lead.initialPotential) customerData['cr1bb_tiemnangbanau'] = lead.initialPotential; // Tiềm năng ban đầu
    if (lead.initialGeneralInfo) customerData['cr1bb_thongtinchungbanau'] = lead.initialGeneralInfo; // Thông tin chung ban đầu
    if (lead.repDescription) customerData['cr1bb_motanguoiaidien'] = lead.repDescription; // Mô tả người đại diện

    return customerData;
}

/**
 * Create new Customer in Dataverse
 */
export async function createCustomer(lead: Lead): Promise<string> {
    try {
        const customerData = mapLeadToCustomer(lead);

        console.log('🔄 Creating customer in Dataverse:', customerData);

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

        console.log('🔄 Updating customer in Dataverse:', customerId, customerData);

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
        return {
            id: data.crdfd_customerid,
            name: data.crdfd_name || '',
            phone: data.cr44a_st || '',
            taxCode: data.crdfd_mst || '',
            address: data.crdfd_address || '',
            birthDate: data.crdfd_ngay_sinh || '',
            loaiCuaHang: data.cr1bb_loaicuahangtext || '',
            district: data.crdfd_quanhuyencal || '',
            city: data.cr1bb_tinhthanh || '',
            detailedIndustry: data.crdfd_nganhnghetext || '',
            tradeName: data.crdfd_Tenthuongmai || 'WeShop',
            keyIndustry: data.cr1bb_nganhchuluc || '',
            subIndustry: data.cr1bb_nganhphu || '',
            paymentTerms: data.crdfd_ieukhoanthanhtoan || '',
            supervisor: data.crdfd_supervisormail || '',
            salesStaff: data.cr1bb_nhanviensaletext || '',
            debtStaff: data.cr1bb_nhanviencongnotext || '',
            initialPotential: data.cr1bb_tiemnangbanau || '',
            initialGeneralInfo: data.cr1bb_thongtinchungbanau || '',
            repDescription: data.cr1bb_motanguoiaidien || '',
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
