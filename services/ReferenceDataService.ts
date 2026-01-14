/**
 * Reference Data Service
 * Fetches lookup data from Dataverse API
 * - Quận/Huyện, Tỉnh/Thành with Supervisor mapping
 * - Employees (Sale, Công nợ)
 * - Choices (Loại cửa hàng, Ngành nghề, Điều khoản thanh toán, etc.)
 */

import { AppConfig } from '../config/app.config';
import { getToken } from '../implicitAuthService';

// Types
export interface QuanHuyen {
    id: string;
    tenQuanHuyen: string;
    tinhThanhId: string;
    tinhThanhName: string;
}

export interface TinhThanh {
    id: string;
    tenTinhThanh: string;
    supervisorId?: string;
    supervisorName?: string;
}

export interface Employee {
    id: string;
    name: string;
    email: string;
    department?: string;
    position?: string;
}

export interface ChoiceOption {
    value: number;
    label: string;
}

// Cache for reference data
let quanHuyenCache: QuanHuyen[] | null = null;
let tinhThanhCache: TinhThanh[] | null = null;
let employeesCache: Employee[] | null = null;
let choicesCache: { [key: string]: ChoiceOption[] } = {};

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
        'Prefer': 'odata.include-annotations="*"'
    };
}

/**
 * Fetch Quận/Huyện with Tỉnh/Thành relationship
 */
export async function fetchQuanHuyen(): Promise<QuanHuyen[]> {
    if (quanHuyenCache) return quanHuyenCache;

    try {
        const url = `${BASE_URL}/crdfd_quanhuyens?$select=crdfd_quanhuyenid,crdfd_name&$expand=crdfd_Tinhthanh($select=crdfd_tinhthanhid,crdfd_name)&$filter=statecode eq 0&$orderby=crdfd_name asc`;

        const response = await fetch(url, { headers: await getHeaders() });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data = await response.json();

        quanHuyenCache = data.value.map((item: any) => ({
            id: item.crdfd_quanhuyenid,
            tenQuanHuyen: item.crdfd_name,
            tinhThanhId: item.crdfd_Tinhthanh?.crdfd_tinhthanhid || '',
            tinhThanhName: item.crdfd_Tinhthanh?.crdfd_name || ''
        }));

        console.log('✅ Loaded', quanHuyenCache.length, 'Quận/Huyện');
        return quanHuyenCache;
    } catch (error) {
        console.error('❌ Error fetching Quận/Huyện:', error);
        return [];
    }
}

/**
 * Fetch Tỉnh/Thành with Supervisor
 */
export async function fetchTinhThanh(): Promise<TinhThanh[]> {
    if (tinhThanhCache) return tinhThanhCache;

    try {
        const url = `${BASE_URL}/crdfd_tinhthanhs?$select=crdfd_tinhthanhid,crdfd_name&$expand=cr1bb_Supervisor($select=crdfd_employeeid,crdfd_name)&$filter=statecode eq 0&$orderby=crdfd_name asc`;

        const response = await fetch(url, { headers: await getHeaders() });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data = await response.json();

        tinhThanhCache = data.value.map((item: any) => ({
            id: item.crdfd_tinhthanhid,
            tenTinhThanh: item.crdfd_name,
            supervisorId: item.cr1bb_Supervisor?.crdfd_employeeid || '',
            supervisorName: item.cr1bb_Supervisor?.crdfd_name || ''
        }));

        console.log('✅ Loaded', tinhThanhCache.length, 'Tỉnh/Thành');
        return tinhThanhCache;
    } catch (error) {
        console.error('❌ Error fetching Tỉnh/Thành:', error);
        return [];
    }
}

/**
 * Fetch Employees (filtered by department)
 * Giống Power Apps: Filter trạng thái Active, Phòng ban (text), không phải "Đã nghỉ"
 */
export async function fetchEmployees(departmentFilter?: string): Promise<Employee[]> {
    try {
        // Base filter: Active state
        let filter = "statecode eq 0";

        // Add department filter (exact match)
        if (departmentFilter) {
            filter += ` and crdfd_phongbantext eq '${departmentFilter}'`;
        }

        // Exclude resigned employees (Trạng thái text <> "Đã nghỉ")  
        filter += " and cr1bb_trangthaitext ne 'Đã nghỉ'";

        const url = `${BASE_URL}/crdfd_employees?$select=crdfd_employeeid,crdfd_name,crdfd_mail,crdfd_phongbantext,cr1bb_trangthaitext&$filter=${encodeURIComponent(filter)}&$orderby=crdfd_name asc&$top=100`;

        console.log('🔍 Fetching employees with filter:', filter);

        const response = await fetch(url, { headers: await getHeaders() });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ API Error:', response.status, errorText);
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        const employees: Employee[] = data.value.map((item: any) => ({
            id: item.crdfd_employeeid,
            name: item.crdfd_name,
            email: item.crdfd_mail || '',
            department: item.crdfd_phongbantext || '',
            position: item.cr1bb_trangthaitext || ''
        }));

        console.log('✅ Loaded', employees.length, 'Employees', departmentFilter ? `(${departmentFilter})` : '');
        return employees;
    } catch (error) {
        console.error('❌ Error fetching Employees:', error);
        return [];
    }
}

/**
 * Fetch Nhân viên công nợ (Phòng kế toán)
 * Giống Power Apps: 'Phòng ban (text)' = "Phòng kế toán"
 */
export async function fetchNhanVienCongNo(): Promise<Employee[]> {
    return fetchEmployees('Phòng kế toán');
}

/**
 * Fetch Nhân viên Sale (Phòng Phát triển Kinh doanh)
 * Theo Power Apps: crdfd_phongbantext = "Phòng Phát triển Kinh doanh"
 */
export async function fetchNhanVienSale(): Promise<Employee[]> {
    return fetchEmployees('Phòng Phát triển Kinh doanh');
}

/**
 * Fetch Nhân viên Sale filter theo Tỉnh/Thành
 */
export async function fetchNhanVienSaleByTinhThanh(tinhThanhName: string): Promise<Employee[]> {
    try {
        // Base filter: Active state, Phòng Phát triển Kinh doanh, không phải "Đã nghỉ"
        // Theo Power Apps: crdfd_phongbantext = "Phòng Phát triển Kinh doanh"
        let filter = "statecode eq 0 and crdfd_phongbantext eq 'Phòng Phát triển Kinh doanh' and cr1bb_trangthaitext ne 'Đã nghỉ'";

        // Filter theo Tỉnh/Thành CAL - escape single quotes trong tên tỉnh thành
        if (tinhThanhName) {
            // Escape single quotes trong tên tỉnh thành để tránh lỗi OData
            const escapedTinhThanh = tinhThanhName.replace(/'/g, "''");
            filter += ` and crdfd_tinhthanhcal eq '${escapedTinhThanh}'`;
        }

        const url = `${BASE_URL}/crdfd_employees?$select=crdfd_employeeid,crdfd_name,crdfd_mail,crdfd_phongbantext,cr1bb_trangthaitext,crdfd_tinhthanhcal&$filter=${encodeURIComponent(filter)}&$orderby=crdfd_name asc&$top=100`;

        console.log('🔍 Fetching nhân viên sale by tỉnh thành:', tinhThanhName);
        console.log('🔍 Filter:', filter);

        const response = await fetch(url, { headers: await getHeaders() });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ API Error:', response.status, errorText);
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        const employees: Employee[] = data.value.map((item: any) => ({
            id: item.crdfd_employeeid,
            name: item.crdfd_name,
            email: item.crdfd_mail || '',
            department: item.crdfd_phongbantext || '',
            position: item.cr1bb_trangthaitext || ''
        }));

        console.log('✅ Loaded', employees.length, 'Nhân viên Sale', tinhThanhName ? `(${tinhThanhName})` : '');
        if (employees.length === 0 && tinhThanhName) {
            console.warn('⚠️ Không tìm thấy nhân viên sale nào cho tỉnh thành:', tinhThanhName);
        }
        return employees;
    } catch (error) {
        console.error('❌ Error fetching Nhân viên Sale by Tỉnh/Thành:', error);
        return [];
    }
}

/**
 * Fetch Choice/Picklist options from Dataverse
 */
export async function fetchChoices(entityName: string, attributeName: string): Promise<ChoiceOption[]> {
    const cacheKey = `${entityName}_${attributeName}`;

    if (choicesCache[cacheKey]) return choicesCache[cacheKey];

    try {
        const url = `${BASE_URL}/EntityDefinitions(LogicalName='${entityName}')/Attributes(LogicalName='${attributeName}')/Microsoft.Dynamics.CRM.PicklistAttributeMetadata?$select=LogicalName&$expand=OptionSet($select=Options)`;

        const response = await fetch(url, { headers: await getHeaders() });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data = await response.json();

        choicesCache[cacheKey] = data.OptionSet.Options.map((opt: any) => ({
            value: opt.Value,
            label: opt.Label.LocalizedLabels[0]?.Label || opt.Label.UserLocalizedLabel?.Label || `Option ${opt.Value}`
        }));

        console.log('✅ Loaded', choicesCache[cacheKey].length, 'choices for', attributeName);
        return choicesCache[cacheKey];
    } catch (error) {
        console.error('❌ Error fetching choices for', attributeName, ':', error);
        return [];
    }
}

/**
 * Fetch all reference data at once
 */
export async function fetchAllReferenceData() {
    console.log('📊 Loading reference data...');

    const [quanHuyen, tinhThanh, nhanVienCongNo, nhanVienSale] = await Promise.all([
        fetchQuanHuyen(),
        fetchTinhThanh(),
        fetchNhanVienCongNo(),
        fetchNhanVienSale()
    ]);

    // Fetch choice picklists
    const [loaiCuaHang, nganhNghe, dieuKhoanThanhToan, tiemNang, nganhHang] = await Promise.all([
        fetchChoices('crdfd_customer', 'cr1bb_loaicuahang'),
        fetchChoices('crdfd_customer', 'crdfd_nganhnghe'),
        fetchChoices('crdfd_customer', 'cr1bb_ieukhoanthanhtoan'),
        fetchChoices('crdfd_customer', 'cr1bb_tiemnangbanau'),
        fetchChoices('crdfd_customer', 'cr1bb_nganhchuluc')
    ]);

    console.log('✅ All reference data loaded');

    return {
        quanHuyen,
        tinhThanh,
        nhanVienCongNo,
        nhanVienSale,
        loaiCuaHang,
        nganhNghe,
        dieuKhoanThanhToan,
        tiemNang,
        nganhHang
    };
}

/**
 * Clear cache (call when needed to refresh)
 */
export function clearReferenceDataCache() {
    quanHuyenCache = null;
    tinhThanhCache = null;
    employeesCache = null;
    choicesCache = {};
    console.log('🔄 Reference data cache cleared');
}

/**
 * Get Supervisor by Tỉnh/Thành name
 */
export function getSupervisorByTinhThanh(tinhThanhName: string): string {
    if (!tinhThanhCache) return '';
    const tt = tinhThanhCache.find(t => t.tenTinhThanh === tinhThanhName);
    return tt?.supervisorName || '';
}

/**
 * Get Tỉnh/Thành by Quận/Huyện name
 */
export function getTinhThanhByQuanHuyen(quanHuyenName: string): string {
    if (!quanHuyenCache) return '';
    const qh = quanHuyenCache.find(q => q.tenQuanHuyen === quanHuyenName);
    return qh?.tinhThanhName || '';
}
