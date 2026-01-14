/**
 * MST Validation Service
 * Kiểm tra MST có tồn tại trong bảng Pháp lý khách hàng (cr1bb_phaplykhachhang)
 */

import { AppConfig } from '../config/app.config';
import { getToken } from '../implicitAuthService';

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
        'Accept': 'application/json'
    };
}

export interface MSTCheckResult {
    exists: boolean;
    customerName?: string;
    customerId?: string;
}

/**
 * Kiểm tra MST có tồn tại trong bảng Pháp lý khách hàng
 * @param mst Mã số thuế cần kiểm tra
 * @returns Kết quả kiểm tra: exists = true nếu MST đã tồn tại
 */
export async function checkMSTExists(mst: string): Promise<MSTCheckResult> {
    // Bỏ qua nếu MST trống
    if (!mst || mst.trim() === '') {
        return { exists: false };
    }

    try {
        console.log('🔍 Checking MST:', mst);

        // Query bảng cr1bb_phaplykhachhang với filter cr1bb_mst = mst
        const filter = `cr1bb_mst eq '${mst.trim()}'`;
        const url = `${BASE_URL}/cr1bb_phaplykhachhangs?$select=cr1bb_phaplykhachhangid,cr1bb_mst,cr1bb_name&$filter=${encodeURIComponent(filter)}&$top=1`;

        const response = await fetch(url, {
            method: 'GET',
            headers: await getHeaders()
        });

        if (!response.ok) {
            console.error('❌ Error checking MST:', response.status);
            // Nếu lỗi query, cho phép tiếp tục (không block save)
            return { exists: false };
        }

        const data = await response.json();

        if (data.value && data.value.length > 0) {
            const existingRecord = data.value[0];
            console.log('⚠️ MST already exists:', existingRecord);

            return {
                exists: true,
                customerName: existingRecord.cr1bb_name || 'Không rõ tên',
                customerId: existingRecord.cr1bb_phaplykhachhangid
            };
        }

        console.log('✅ MST is unique');
        return { exists: false };

    } catch (error) {
        console.error('❌ Error checking MST:', error);
        // Nếu lỗi, cho phép tiếp tục (không block save)
        return { exists: false };
    }
}
