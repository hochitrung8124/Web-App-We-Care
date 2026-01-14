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
