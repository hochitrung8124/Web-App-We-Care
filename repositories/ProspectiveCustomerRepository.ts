/**
 * Prospective Customer Repository
 * Data access layer for prospective customers
 * Follows Repository Pattern and Single Responsibility Principle
 */

import { IRepository } from '../interfaces/IRepository';
import { IDataverseProspectiveCustomer, IDataverseResponse, IDataverseQueryOptions } from '../interfaces/IDataverseEntities';
import { IHttpClient } from '../interfaces/IHttpClient';
import { IMapper } from '../interfaces/IMapper';
import { Lead } from '../types';
import { AppConfig } from '../config/app.config';

export class ProspectiveCustomerRepository implements IRepository<IDataverseProspectiveCustomer, Lead> {
  private readonly baseUrl: string;
  private readonly entityName: string;

  constructor(
    private httpClient: IHttpClient,
    private mapper: IMapper<IDataverseProspectiveCustomer, Lead>
  ) {
    this.baseUrl = AppConfig.dataverse.baseUrl;
    this.entityName = AppConfig.dataverse.entityName;
  }

  /**
   * Build query string from options
   */
  private buildQueryString(options?: IDataverseQueryOptions): string {
    if (!options) {
      return `?$top=${AppConfig.dataverse.defaultPageSize}&$orderby=createdon desc&$select=crdfd_prospectivecustomerid,crdfd_name,crdfd_phonenumber,crdfd_email,crdfd_address,crdfd_leadsource,crdfd_verify,crdfd_taxcode,_crdfd_quanhuyen_value,_crdfd_tinhthanh_value,cr1bb_note`;
    }

    const params = new URLSearchParams();
    
    if (options.top) params.append('$top', options.top.toString());
    if (options.skip) params.append('$skip', options.skip.toString());
    if (options.filter) params.append('$filter', options.filter);
    if (options.orderby) params.append('$orderby', options.orderby);
    if (options.select?.length) {
      params.append('$select', options.select.join(','));
    } else {
      // Default select with only existing fields in crdfd_prospectivecustomer
      params.append('$select', 'crdfd_prospectivecustomerid,crdfd_name,crdfd_phonenumber,crdfd_email,crdfd_address,crdfd_leadsource,crdfd_verify,crdfd_taxcode,_crdfd_quanhuyen_value,_crdfd_tinhthanh_value,cr1bb_note');
    }
    
    // Set default orderby if not provided
    if (!options.orderby) {
      params.append('$orderby', 'createdon desc');
    }

    return `?${params.toString()}`;
  }

  /**
   * Get all prospective customers
   */
  async getAll(options?: IDataverseQueryOptions): Promise<Lead[]> {
    const queryString = this.buildQueryString(options);
    const url = `${this.baseUrl}/${this.entityName}${queryString}`;
    
    console.log('🔄 Fetching prospective customers...');
    console.log('📍 URL:', url);
    
    const response = await this.httpClient.get<IDataverseResponse<IDataverseProspectiveCustomer>>(
      url,
      { 'Prefer': 'odata.include-annotations="*"' }
    );
    
    console.log('✅ Fetched', response.value.length, 'records');
    
    return response.value.map(entity => this.mapper.map(entity));
  }

  /**
   * Get prospective customer by ID
   */
  async getById(id: string): Promise<Lead> {
    const url = `${this.baseUrl}/${this.entityName}(${id})`;
    
    console.log('🔄 Fetching customer:', id);
    
    const entity = await this.httpClient.get<IDataverseProspectiveCustomer>(url);
    
    return this.mapper.map(entity);
  }

  /**
   * Create new prospective customer
   */
  async create(data: Partial<Lead>): Promise<string> {
    const url = `${this.baseUrl}/${this.entityName}`;
    
    console.log('🔄 Creating new customer...');
    
    const entityData = this.mapper.mapReverse?.(data as Lead) || {};
    
    const created = await this.httpClient.post<IDataverseProspectiveCustomer>(url, entityData);
    
    console.log('✅ Customer created:', created.crdfd_prospectivecustomerid);
    
    return created.crdfd_prospectivecustomerid;
  }

  /**
   * Update prospective customer
   */
  async update(id: string, data: Partial<Lead>): Promise<void> {
    const url = `${this.baseUrl}/${this.entityName}(${id})`;
    
    console.log('🔄 Updating customer:', id);
    
    const entityData = this.mapper.mapReverse?.(data as Lead) || {};
    
    await this.httpClient.patch(url, entityData);
    
    console.log('✅ Customer updated');
  }

}
