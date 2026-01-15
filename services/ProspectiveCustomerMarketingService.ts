/**
 * ProspectiveCustomer Marketing Service
 * Dùng cho role Marketing - chỉ update 4 trường cơ bản + trạng thái
 * Bảng: crdfd_prospectivecustomer (Khách hàng tiềm năng)
 */

import { AppConfig } from '../config/app.config';
import { getToken } from '../implicitAuthService';

const BASE_URL = AppConfig.dataverse.baseUrl;

interface MarketingUpdateData {
    name: string;
    phone: string;
    taxCode?: string;
    address?: string;
    district?: string;
    city?: string;
}

// Helper function to get Quận Huyện ID by name
async function getQuanHuyenIdByName(name: string): Promise<string | null> {
    const token = await getToken();
    try {
        const response = await fetch(
            `${BASE_URL}/crdfd_quanhuyens?$filter=crdfd_name eq '${encodeURIComponent(name)}'&$select=crdfd_quanhuyenid`,
            {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'OData-MaxVersion': '4.0',
                    'OData-Version': '4.0',
                    'Accept': 'application/json'
                }
            }
        );

        if (!response.ok) {
            if (response.status === 403) {
                console.warn('⚠️ 403 Forbidden on crdfd_quanhuyens - storing district as text only');
            } else {
                console.error('❌ Error fetching Quận Huyện:', response.status);
            }
            return null;
        }

        const data = await response.json();
        const quanHuyenId = data.value?.[0]?.crdfd_quanhuyenid || null;
        console.log('🔍 getQuanHuyenIdByName:', name, '→', quanHuyenId);
        return quanHuyenId;
    } catch (error) {
        console.error('Error fetching Quận Huyện ID:', error);
        return null;
    }
}

// Helper function to get Tỉnh Thành ID by name
async function getTinhThanhIdByName(name: string): Promise<string | null> {
    const token = await getToken();
    try {
        // Use crdfd_name which is the actual field name in the Tỉnh Thành table
        const response = await fetch(
            `${BASE_URL}/crdfd_tinhthanhs?$filter=crdfd_name eq '${encodeURIComponent(name)}'&$select=crdfd_tinhthanhid`,
            {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'OData-MaxVersion': '4.0',
                    'OData-Version': '4.0',
                    'Accept': 'application/json'
                }
            }
        );

        if (!response.ok) {
            console.error('❌ Error fetching Tỉnh Thành:', response.status);
            return null;
        }

        const data = await response.json();
        const tinhThanhId = data.value?.[0]?.crdfd_tinhthanhid || null;
        console.log('🔍 getTinhThanhIdByName:', name, '→', tinhThanhId);
        return tinhThanhId;
    } catch (error) {
        console.error('Error fetching Tỉnh Thành ID:', error);
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
        'Accept': 'application/json'
    };
}

/**
 * Update ProspectiveCustomer - Marketing only updates these fields
 * Fields mapping:
 * - name → crdfd_name
 * - phone → crdfd_phonenumber
 * - taxCode → crdfd_taxcode
 * - address → crdfd_address
 * - district → crdfd_Quanhuyen@odata.bind (lookup)
 * - city → crdfd_Tinhthanh@odata.bind (lookup)
 * - status → crdfd_verify = 191920001 (Marketing đã xác nhận)
 */
export async function updateProspectiveCustomerMarketing(
    id: string,
    data: MarketingUpdateData
): Promise<void> {
    try {
        // Build update payload with only Marketing-allowed fields
        const updatePayload: Record<string, any> = {};

        if (data.name) {
            updatePayload['crdfd_name'] = data.name;
        }

        if (data.phone) {
            updatePayload['crdfd_phonenumber'] = data.phone;
        }

        if (data.taxCode !== undefined) {
            updatePayload['crdfd_taxcode'] = data.taxCode;
        }

        if (data.address !== undefined) {
            updatePayload['crdfd_address'] = data.address;
        }

        // Quận huyện - try lookup first, then fallback to text field
        if (data.district && data.district !== 'N/A') {
            const quanHuyenId = await getQuanHuyenIdByName(data.district);
            if (quanHuyenId) {
                updatePayload['crdfd_Quanhuyen@odata.bind'] = `/crdfd_quanhuyens(${quanHuyenId})`;
                console.log('✅ [Marketing] Set crdfd_Quanhuyen (lookup):', data.district);
            } else {
                // Fallback: Try storing as text if there's a text field
                // Common alternatives: crdfd_district, crdfd_quanhuyentext, cr1bb_quanhuyen
                updatePayload['crdfd_district'] = data.district;
                console.log('ℹ️ [Marketing] Set crdfd_district (text):', data.district);
            }
        }

        // Tỉnh thành - try lookup first, then fallback to text field
        if (data.city && data.city !== 'N/A') {
            const tinhThanhId = await getTinhThanhIdByName(data.city);
            if (tinhThanhId) {
                updatePayload['crdfd_Tinhthanh@odata.bind'] = `/crdfd_tinhthanhs(${tinhThanhId})`;
                console.log('✅ [Marketing] Set crdfd_Tinhthanh (lookup):', data.city);
            } else {
                // Fallback: Try storing as text if there's a text field
                updatePayload['crdfd_city'] = data.city;
                console.log('ℹ️ [Marketing] Set crdfd_city (text):', data.city);
            }
        }

        // Set status to "Marketing đã xác nhận" (191920001)
        updatePayload['crdfd_verify'] = 191920001;

        console.log('📤 [Marketing] Updating ProspectiveCustomer:', id);
        console.log('📤 [Marketing] Payload:', updatePayload);

        const response = await fetch(
            `${BASE_URL}/crdfd_prospectivecustomers(${id})`,
            {
                method: 'PATCH',
                headers: await getHeaders(),
                body: JSON.stringify(updatePayload)
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ [Marketing] Update Error:', response.status, errorText);
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        console.log('✅ [Marketing] ProspectiveCustomer updated with status "Marketing đã xác nhận"');
    } catch (error) {
        console.error('❌ [Marketing] Error updating ProspectiveCustomer:', error);
        throw error;
    }
}

/**
 * Reject ProspectiveCustomer - Mark as "Khách hàng không hợp tác"
 * Status value: 191920004
 */
export async function rejectProspectiveCustomer(id: string): Promise<void> {
    try {
        const updatePayload = {
            'crdfd_verify': 191920004 // Khách hàng không hợp tác
        };

        console.log('📤 [Marketing] Rejecting ProspectiveCustomer:', id);

        const response = await fetch(
            `${BASE_URL}/crdfd_prospectivecustomers(${id})`,
            {
                method: 'PATCH',
                headers: await getHeaders(),
                body: JSON.stringify(updatePayload)
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ [Marketing] Reject Error:', response.status, errorText);
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        console.log('✅ [Marketing] ProspectiveCustomer marked as "Khách hàng không hợp tác"');
    } catch (error) {
        console.error('❌ [Marketing] Error rejecting ProspectiveCustomer:', error);
        throw error;
    }
}
