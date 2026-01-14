/**
 * Status Mapper Utility
 * Map between Dataverse status codes and application status
 */

import { Lead } from '../types';

export type DataverseStatus = 191920000 | 191920001 | 191920002;
export type LeadStatus = Lead['status'];

/**
 * Map Dataverse status number to Lead status string
 * @deprecated Use FormattedValue from Dataverse instead
 */
export const mapDataverseStatus = (status?: number): string => {
  switch (status) {
    case 191920000:
      return 'Đợi xác nhận';
    case 191920001:
      return 'Marketing đã xác nhận';
    case 191920002:
      return 'Sale đã liên hệ';
    default:
      return 'Unknown';
  }
};

/**
 * Map Lead status string to Dataverse status number
 */
export const mapLeadStatus = (status: string): DataverseStatus => {
  switch (status) {
    case 'Đợi xác nhận':
    case 'Chờ xác nhận':
      return 191920000;
    case 'Marketing đã xác nhận':
      return 191920001;
    case 'Sale đã liên hệ':
      return 191920002;
    default:
      // Default to waiting status
      return 191920000;
  }
};
