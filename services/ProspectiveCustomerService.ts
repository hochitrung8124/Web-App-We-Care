/**
 * Prospective Customer Service
 * Business logic layer
 * Follows Single Responsibility and Dependency Inversion Principles
 */

import { IRepository } from '../interfaces/IRepository';
import { IDataverseProspectiveCustomer } from '../interfaces/IDataverseEntities';
import { Lead } from '../types';

export interface IProspectiveCustomerService {
  /**
   * Get list of prospective customers
   */
  getProspectiveCustomers(top?: number): Promise<Lead[]>;
  
  /**
   * Get single prospective customer by ID
   */
  getProspectiveCustomerById(id: string): Promise<Lead>;
  
  /**
   * Update customer status
   */
  updateCustomerStatus(id: string, status: Lead['status']): Promise<void>;
  
  /**
   * Update prospective customer (full update)
   */
  updateProspectiveCustomer(id: string, data: Lead): Promise<void>;
  
  /**
   * Create new prospective customer
   */
  createProspectiveCustomer(data: Partial<Lead>): Promise<string>;
}

export class ProspectiveCustomerService implements IProspectiveCustomerService {
  constructor(
    private repository: IRepository<IDataverseProspectiveCustomer, Lead>
  ) {}

  /**
   * Get prospective customers with optional limit
   */
  async getProspectiveCustomers(top?: number): Promise<Lead[]> {
    return this.repository.getAll({ 
      top,
      orderby: 'createdon desc' 
    });
  }

  /**
   * Get single customer by ID
   */
  async getProspectiveCustomerById(id: string): Promise<Lead> {
    if (!id) {
      throw new Error('Customer ID is required');
    }
    
    return this.repository.getById(id);
  }

  /**
   * Update customer status
   */
  async updateCustomerStatus(id: string, status: Lead['status']): Promise<void> {
    if (!id) {
      throw new Error('Customer ID is required');
    }
    
    console.log('🔄 Updating status:', id, '→', status);
    
    await this.repository.update(id, { status });
    
    console.log('✅ Status updated');
  }

  /**
   * Update prospective customer (full update)
   */
  async updateProspectiveCustomer(id: string, data: Lead): Promise<void> {
    if (!id) {
      throw new Error('Customer ID is required');
    }
    
    console.log('🔄 Updating customer:', id);
    
    await this.repository.update(id, data);
    
    console.log('✅ Customer updated');
  }

  /**
   * Create new customer with validation
   */
  async createProspectiveCustomer(data: Partial<Lead>): Promise<string> {
    // Validate required fields
    if (!data.name) {
      throw new Error('Customer name is required');
    }
    
    console.log('🔄 Creating customer:', data.name);
    
    const id = await this.repository.create(data);
    
    console.log('✅ Customer created with ID:', id);
    
    return id;
  }
}
