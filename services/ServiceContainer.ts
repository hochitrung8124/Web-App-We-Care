/**
 * Service Container
 * Dependency Injection Container
 * Follows Dependency Inversion Principle
 */

import { AuthProvider } from '../services/AuthProvider';
import { DataverseHttpClient } from '../services/DataverseHttpClient';
import { ProspectiveCustomerMapper } from '../mappers/ProspectiveCustomerMapper';
import { ProspectiveCustomerRepository } from '../repositories/ProspectiveCustomerRepository';
import { ProspectiveCustomerService, IProspectiveCustomerService } from '../services/ProspectiveCustomerService';

/**
 * Service Container - Singleton pattern
 */
class ServiceContainer {
  private static instance: ServiceContainer;
  private services: Map<string, any> = new Map();

  private constructor() {
    this.registerServices();
  }

  static getInstance(): ServiceContainer {
    if (!ServiceContainer.instance) {
      ServiceContainer.instance = new ServiceContainer();
    }
    return ServiceContainer.instance;
  }

  /**
   * Register all services and dependencies
   */
  private registerServices(): void {
    // Auth Provider
    const authProvider = new AuthProvider();
    this.services.set('AuthProvider', authProvider);

    // HTTP Client
    const httpClient = new DataverseHttpClient(authProvider);
    this.services.set('HttpClient', httpClient);

    // Mapper
    const mapper = new ProspectiveCustomerMapper();
    this.services.set('ProspectiveCustomerMapper', mapper);

    // Repository
    const repository = new ProspectiveCustomerRepository(httpClient, mapper);
    this.services.set('ProspectiveCustomerRepository', repository);

    // Service
    const service = new ProspectiveCustomerService(repository);
    this.services.set('ProspectiveCustomerService', service);
  }

  /**
   * Get service by name
   */
  getService<T>(name: string): T {
    const service = this.services.get(name);
    if (!service) {
      throw new Error(`Service ${name} not found`);
    }
    return service as T;
  }

  /**
   * Get Prospective Customer Service
   */
  getProspectiveCustomerService(): IProspectiveCustomerService {
    return this.getService<IProspectiveCustomerService>('ProspectiveCustomerService');
  }
}

// Export singleton instance
export const serviceContainer = ServiceContainer.getInstance();

// Export convenience function
export const getProspectiveCustomerService = (): IProspectiveCustomerService => {
  return serviceContainer.getProspectiveCustomerService();
};
