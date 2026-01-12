/**
 * Status Mapper Utility
 * Map between Dataverse status codes and application status
 */

import { Lead } from '../types';

export type DataverseStatus = 0 | 1 | 2;
export type LeadStatus = Lead['status'];

/**
 * Map Dataverse status number to Lead status string
 */
export const mapDataverseStatus = (status?: number): LeadStatus => {
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
export const mapLeadStatus = (status: LeadStatus): DataverseStatus => {
  switch (status) {
    case 'Đợi xác nhận':
      return 1;
    case 'Marketing đã xác nhận':
      return 2;
    case 'Sale đã liên hệ':
    default:
      return 0;
  }
};
