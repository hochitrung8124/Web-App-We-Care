/**
 * Status Mapper Utility
 * Map between Dataverse status codes and application status
 */

import { Lead } from '../types';

export type DataverseStatus = 0 | 1 | 2;
export type LeadStatus = Lead['status'];

/**
 * Map Dataverse status number to Lead status string
 * @deprecated Use FormattedValue from Dataverse instead
 */
export const mapDataverseStatus = (status?: number): string => {
  switch (status) {
    case 1:
      return 'Đợi xác nhận';
    case 2:
      return 'Marketing đã xác nhận';
    case 0:
    default:
      return 'Sale đã liên hệ';
  }
};

/**
 * Map Lead status string to Dataverse status number
 */
export const mapLeadStatus = (status: string): DataverseStatus => {
  switch (status) {
    case 'Đợi xác nhận':
      return 1;
    case 'Marketing đã xác nhận':
      return 2;
    case 'Sale đã liên hệ':
      return 0;
    default:
      // Fallback for unknown status - maybe log a warning?
      // Assuming 0 is a safe default or we need to handle this.
      return 0;
  }
};
