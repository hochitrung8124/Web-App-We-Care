/**
 * Customer Service
 * CRUD operations for Customers table (crdfd_customers)
 * Mapping các fields từ form sang Dataverse
 */

import { AppConfig } from '../config/app.config';
import { getToken } from '../implicitAuthService';
import { Lead } from '../types';
import { fetchQuanHuyen, fetchTinhThanh, fetchNhanVienSale, fetchNhanVienCongNo } from './ReferenceDataService';

const BASE_URL = AppConfig.dataverse.baseUrl;

// Cache Dataverse attribute types to avoid repeated metadata calls
const attributeTypeCache: Record<string, string> = {};

/**
 * Helper: Get Dataverse attribute type (e.g. "Picklist", "MultiSelectPicklist", "String")
 */
async function getAttributeType(entityLogicalName: string, attributeLogicalName: string): Promise<string | null> {
    const cacheKey = `${entityLogicalName}.${attributeLogicalName}`;
    if (attributeTypeCache[cacheKey]) return attributeTypeCache[cacheKey];

    try {
        const url = `${BASE_URL}/EntityDefinitions(LogicalName='${entityLogicalName}')/Attributes(LogicalName='${attributeLogicalName}')?$select=AttributeType`;
        const response = await fetch(url, { headers: await getHeaders() });
        if (!response.ok) return null;
        const data = await response.json();
        const type = data?.AttributeType as string | undefined;
        if (type) {
            attributeTypeCache[cacheKey] = type;
            return type;
        }
        return null;
    } catch {
        return null;
    }
}

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
 * Helper: Tìm ID của Quận/Huyện từ tên
 */
async function getQuanHuyenIdByName(name: string): Promise<string | null> {
    if (!name) return null;
    try {
        const quanHuyenList = await fetchQuanHuyen();
        const found = quanHuyenList.find(qh => qh.tenQuanHuyen === name);
        return found?.id || null;
    } catch (error) {
        console.error('❌ Error finding Quận/Huyện ID:', error);
        return null;
    }
}

/**
 * Helper: Tìm ID của Tỉnh/Thành từ tên
 */
async function getTinhThanhIdByName(name: string): Promise<string | null> {
    if (!name) return null;
    try {
        const tinhThanhList = await fetchTinhThanh();
        const found = tinhThanhList.find(tt => tt.tenTinhThanh === name);
        return found?.id || null;
    } catch (error) {
        console.error('❌ Error finding Tỉnh/Thành ID:', error);
        return null;
    }
}

/**
 * Helper: Tìm ID của Nhân viên Sale từ tên
 */
async function getNhanVienSaleIdByName(name: string): Promise<string | null> {
    if (!name) return null;
    try {
        const nhanVienSaleList = await fetchNhanVienSale();
        const found = nhanVienSaleList.find(nv => nv.name === name);
        return found?.id || null;
    } catch (error) {
        console.error('❌ Error finding Nhân viên Sale ID:', error);
        return null;
    }
}

/**
 * Helper: Tìm ID của Nhân viên Công nợ từ tên
 */
async function getNhanVienCongNoIdByName(name: string): Promise<string | null> {
    if (!name) return null;
    try {
        const nhanVienCongNoList = await fetchNhanVienCongNo();
        const found = nhanVienCongNoList.find(nv => nv.name === name);
        return found?.id || null;
    } catch (error) {
        console.error('❌ Error finding Nhân viên Công nợ ID:', error);
        return null;
    }
}

/**
 * Mapping Lead (form) -> Dataverse Customer fields
 * Dựa trên Customers.json NativeCDSDataSourceInfoNameMapping
 */
async function mapLeadToCustomer(lead: Lead): Promise<Record<string, any>> {
    const customerData: Record<string, any> = {};

    // Thông tin cơ bản - đảm bảo luôn là string
    if (lead.name) customerData['crdfd_name'] = String(lead.name);                          // Customer name
    if (lead.phone) customerData['cr44a_st'] = String(lead.phone);                          // Điện thoại
    if (lead.taxCode) customerData['crdfd_mst'] = String(lead.taxCode);                     // MST
    if (lead.address) customerData['crdfd_address'] = String(lead.address);                 // Địa chỉ
    if (lead.birthDate) customerData['crdfd_ngay_sinh'] = String(lead.birthDate);           // Ngày sinh

    // Loại cửa hàng - OptionSet yêu cầu số nguyên
    if (lead.loaiCuaHang) {
        const loaiCuaHangValue = typeof lead.loaiCuaHang === 'string'
            ? parseInt(lead.loaiCuaHang, 10)
            : lead.loaiCuaHang;
        if (!isNaN(loaiCuaHangValue)) {
            customerData['cr1bb_loaicuahang'] = loaiCuaHangValue;
        }
    }

    // Vị trí - Quận huyện, Tỉnh thành
    // Set lookup ID nếu có, nếu không thì dùng text field
    if (lead.district) {
        const quanHuyenId = await getQuanHuyenIdByName(lead.district);
        if (quanHuyenId) {
            customerData['crdfd_Quanhuyen@odata.bind'] = `/crdfd_quanhuyens(${quanHuyenId})`;
        } else {
            // Fallback to text field
            customerData['crdfd_quanhuyencal'] = String(lead.district);
        }
    }
    if (lead.city) {
        const tinhThanhId = await getTinhThanhIdByName(lead.city);
        if (tinhThanhId) {
            customerData['crdfd_Tinhthanh@odata.bind'] = `/crdfd_tinhthanhs(${tinhThanhId})`;
        } else {
            // Fallback to text field
            customerData['cr1bb_tinhthanh'] = String(lead.city);
        }
    }

    // Ngành nghề chi tiết - OptionSet field (crdfd_nganhnghe)
    // Mapping từ text label sang OptionSet value
    const NGANH_NGHE_MAPPING: Record<string, number> = {
        '1. Nhà máy gỗ': 191920000,
        '2. Wicker': 191920001,
        '3. Xây dựng': 191920002,
        '4. Thi công nội thất': 191920003,
        '5. Shop bán lẻ': 191920004,
        '6. Sản xuất khác': 191920006,
        '7. CTV': 191920008,
        '8. Công ty thương mại': 191920009,
    };

    console.log('🔍 Debug detailedIndustry:', lead.detailedIndustry, 'Text:', lead.detailedIndustryText);

    // Xác định giá trị text cho mapping
    const industryTextForMapping = lead.detailedIndustryText || lead.detailedIndustry || '';

    // Lưu OptionSet value (số) vào crdfd_nganhnghe
    if (lead.detailedIndustry) {
        let detailedIndustryValue: number | undefined;

        // Kiểm tra xem có phải là số hợp lệ không (191920xxx)
        const parsedValue = parseInt(String(lead.detailedIndustry), 10);
        if (!isNaN(parsedValue) && parsedValue >= 191920000) {
            // Đã là OptionSet value hợp lệ
            detailedIndustryValue = parsedValue;
        } else {
            // Là text label, cần map sang OptionSet value
            detailedIndustryValue = NGANH_NGHE_MAPPING[String(lead.detailedIndustry)];
        }

        if (detailedIndustryValue !== undefined) {
            customerData['crdfd_nganhnghe'] = detailedIndustryValue;
            console.log('✅ Set crdfd_nganhnghe =', detailedIndustryValue);
        } else {
            console.warn('⚠️ Cannot map detailedIndustry to OptionSet value:', lead.detailedIndustry);
        }
    }

    // Lưu text vào crdfd_nganhnghetext để tương thích
    if (industryTextForMapping && NGANH_NGHE_MAPPING[industryTextForMapping]) {
        // Nếu là text label hợp lệ, lưu
        customerData['crdfd_nganhnghetext'] = industryTextForMapping;
    } else if (lead.detailedIndustryText) {
        customerData['crdfd_nganhnghetext'] = String(lead.detailedIndustryText);
    }

    // Tự động set Ngành nghề (cr1bb_nganhnghemoi) dựa trên text
    // "5. Shop bán lẻ" hoặc "7. CTV" -> Shop (283640001)
    // Còn lại -> Nhà máy (283640000)
    const industryTextLower = industryTextForMapping.toLowerCase();
    if (industryTextLower.includes('shop') || industryTextLower.includes('ctv')) {
        customerData['cr1bb_nganhnghemoi'] = 283640001; // Shop
        console.log('✅ Set cr1bb_nganhnghemoi = Shop (283640001)');
    } else if (industryTextForMapping) {
        customerData['cr1bb_nganhnghemoi'] = 283640000; // Nhà máy
        console.log('✅ Set cr1bb_nganhnghemoi = Nhà máy (283640000)');
    }

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
    // Ngành phụ - type có thể thay đổi theo Dataverse config (Picklist vs String)
    // Quy ước lưu ở form:
    // - OptionSet: lưu value(s) dạng "283640001,283640002"
    // - String: lưu text (hoặc cũng có thể là "283640001" dạng string)
    if (lead.subIndustry) {
        const subIndustryStr = String(lead.subIndustry).trim();
        if (subIndustryStr) {
            const attributeType = await getAttributeType('crdfd_customer', 'cr1bb_nganhphu');

            if (attributeType === 'Picklist' || attributeType === 'MultiSelectPicklist') {
                const firstValue = subIndustryStr.includes(',')
                    ? subIndustryStr.split(',')[0].trim()
                    : subIndustryStr;
                const value = Number.parseInt(firstValue, 10);
                if (!Number.isNaN(value)) {
                    customerData['cr1bb_nganhphu'] = value;
                }
            } else {
                // Default/fallback: gửi string để tránh lỗi Edm.String
                customerData['cr1bb_nganhphu'] = subIndustryStr;
            }
        }
    }
    // Điều khoản thanh toán - Text field yêu cầu string (label)
    if (lead.paymentTerms) {
        customerData['crdfd_ieukhoanthanhtoan'] = String(lead.paymentTerms);
    }

    // Nhân sự phụ trách
    // Set lookup ID nếu có, nếu không thì dùng text field
    if (lead.supervisor) {
        customerData['crdfd_supervisormail'] = String(lead.supervisor); // Supervisor - mail (text)
    }
    if (lead.salesStaff) {
        const nhanVienSaleId = await getNhanVienSaleIdByName(lead.salesStaff);
        if (nhanVienSaleId) {
            customerData['crdfd_Salename@odata.bind'] = `/crdfd_employees(${nhanVienSaleId})`;
        } else {
            // Fallback to text field
            customerData['cr1bb_nhanviensaletext'] = String(lead.salesStaff);
        }
    }
    if (lead.debtStaff) {
        const nhanVienCongNoId = await getNhanVienCongNoIdByName(lead.debtStaff);
        if (nhanVienCongNoId) {
            customerData['cr1bb_Nhanviencongno@odata.bind'] = `/crdfd_employees(${nhanVienCongNoId})`;
        } else {
            // Fallback to text field
            customerData['cr1bb_nhanviencongnotext'] = String(lead.debtStaff);
        }
    }

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
        const customerData = await mapLeadToCustomer(lead);

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
        const customerData = await mapLeadToCustomer(lead);

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
        const response = await fetch(`${BASE_URL}/crdfd_customers(${customerId})?$select=crdfd_customerid,crdfd_name,cr44a_st,crdfd_mst,crdfd_address,crdfd_ngay_sinh,cr1bb_loaicuahang,crdfd_quanhuyencal,cr1bb_tinhthanh,crdfd_nganhnghe,crdfd_nganhnghetext,crdfd_Tenthuongmai,cr1bb_nganhchuluc,cr1bb_nganhphu,crdfd_ieukhoanthanhtoan,crdfd_supervisormail,cr1bb_nhanviensaletext,cr1bb_nhanviencongnotext,cr1bb_tiemnangbanau,cr1bb_thongtinchungbanau,cr1bb_motanguoiaidien`, {
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
            // OptionSet values từ API là số, chuyển thành string để match với form select
            loaiCuaHang: data.cr1bb_loaicuahang != null ? String(data.cr1bb_loaicuahang) : '',
            district: data.crdfd_quanhuyencal != null ? String(data.crdfd_quanhuyencal) : '',
            city: data.cr1bb_tinhthanh != null ? String(data.cr1bb_tinhthanh) : '',
            // Ngành nghề chi tiết - cả số (OptionSet) và text
            detailedIndustry: data.crdfd_nganhnghe != null ? String(data.crdfd_nganhnghe) : '',
            detailedIndustryText: data.crdfd_nganhnghetext != null ? String(data.crdfd_nganhnghetext) : '',
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
