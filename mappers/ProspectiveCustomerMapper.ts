/**
 * Prospective Customer Mapper
 * Maps between Dataverse entities and application models
 * Follows Single Responsibility Principle
 */

import { IMapper } from '../interfaces/IMapper';
import { IDataverseProspectiveCustomer } from '../interfaces/IDataverseEntities';
import { Lead } from '../types';
import { getInitials, getColorFromString } from '../utils/stringUtils';
import { mapDataverseStatus, mapLeadStatus } from '../utils/statusMapper';
import { AppConfig } from '../config/app.config';

export class ProspectiveCustomerMapper 
  implements IMapper<IDataverseProspectiveCustomer, Lead> {
  
  /**
   * Map Dataverse entity to Lead model
   */
  map(entity: IDataverseProspectiveCustomer): Lead {
    const name = entity.crdfd_name || 'Unknown';
    
    return {
      id: entity.crdfd_prospectivecustomerid,
      name: name,
      subInfo: entity.crdfd_subinfo || entity.crdfd_detailedindustry || 'N/A',
      initials: getInitials(name),
      phone: entity.crdfd_phonenumber || 'N/A',
      email: entity.crdfd_email || 'N/A',
      address: entity.crdfd_address || 'N/A',
      source: entity['crdfd_leadsource@OData.Community.Display.V1.FormattedValue'] || 'Unknown',
      campaign: entity.crdfd_campaign || 'N/A',
      status: mapDataverseStatus(entity.crdfd_verify),
      taxCode: entity.crdfd_taxcode || 'N/A',
      avatarColorClass: getColorFromString(name, AppConfig.ui.avatarColors),
      
      // Optional fields
      birthDate: entity.crdfd_birthdate,
      detailedIndustry: entity.crdfd_detailedindustry,
      district: entity.crdfd_district || 'N/A',
      city: entity.crdfd_city || 'N/A',
      paymentTerms: entity.crdfd_paymentterms,
      tradeName: entity.crdfd_tradename || name,
      supervisor: entity.crdfd_supervisor || 'N/A',
      salesStaff: entity.crdfd_salesstaff,
      debtStaff: entity.crdfd_debtstaff,
      initialPotential: entity.crdfd_initialpotential,
      initialGeneralInfo: entity.crdfd_initialgeneralinfo,
      repDescription: entity.crdfd_repdescription,
      keyIndustry: entity.crdfd_keyindustry,
      subIndustry: entity.crdfd_subindustry,
    };
  }

  /**
   * Map Lead model back to Dataverse entity (for create/update)
   */
  mapReverse(lead: Lead): Partial<IDataverseProspectiveCustomer> {
    return {
      crdfd_name: lead.name,
      crdfd_phonenumber: lead.phone !== 'N/A' ? lead.phone : undefined,
      crdfd_email: lead.email !== 'N/A' ? lead.email : undefined,
      crdfd_address: lead.address !== 'N/A' ? lead.address : undefined,
      crdfd_campaign: lead.campaign !== 'N/A' ? lead.campaign : undefined,
      crdfd_verify: mapLeadStatus(lead.status),
      crdfd_taxcode: lead.taxCode !== 'N/A' ? lead.taxCode : undefined,
      crdfd_city: lead.city !== 'N/A' ? lead.city : undefined,
      crdfd_district: lead.district !== 'N/A' ? lead.district : undefined,
      crdfd_tradename: lead.tradeName,
      crdfd_supervisor: lead.supervisor !== 'N/A' ? lead.supervisor : undefined,
      crdfd_salesstaff: lead.salesStaff,
      crdfd_debtstaff: lead.debtStaff,
      crdfd_birthdate: lead.birthDate,
      crdfd_detailedindustry: lead.detailedIndustry,
      crdfd_paymentterms: lead.paymentTerms,
      crdfd_initialpotential: lead.initialPotential,
      crdfd_initialgeneralinfo: lead.initialGeneralInfo,
      crdfd_repdescription: lead.repDescription,
      crdfd_keyindustry: lead.keyIndustry,
      crdfd_subindustry: lead.subIndustry,
      crdfd_subinfo: lead.subInfo !== 'N/A' ? lead.subInfo : undefined,
    };
  }
}
