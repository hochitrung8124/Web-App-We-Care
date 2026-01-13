/**
 * Main Entry Point for Dataverse Integration
 * Export public API
 */

// Export service container and main service
export { getProspectiveCustomerService } from './ServiceContainer';
export type { IProspectiveCustomerService } from './ProspectiveCustomerService';
export { roleService } from './RoleService';
export type { UserRoleInfo } from './RoleService';

// Export Reference Data Service
export * from './ReferenceDataService';

// Export types if needed
export type { IDataverseQueryOptions } from '../interfaces/IDataverseEntities';

// Re-export from types.ts for convenience
export type { Lead } from '../types';
