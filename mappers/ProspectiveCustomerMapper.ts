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
import { mapSourceToDataverse } from '../utils/sourceMapper';
import { AppConfig } from '../config/app.config';

export class ProspectiveCustomerMapper
  implements IMapper<IDataverseProspectiveCustomer, Lead> {

  /**
   * Map Dataverse entity to Lead model
   */
  map(entity: IDataverseProspectiveCustomer): Lead {
    const name = entity.crdfd_name || 'Unknown';

    // Debug logging for notes field
    if (name === 'Hihi') {
      console.log('🔍 DEBUG Hihi customer:', {
        name,
        cr1bb_note: entity.cr1bb_note,
        hasNote: !!entity.cr1bb_note,
        fullEntity: entity
      });
    }

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
      status: entity['crdfd_verify@OData.Community.Display.V1.FormattedValue'] || 'Unknown',
      statusCode: entity.crdfd_verify,
      taxCode: entity.crdfd_taxcode || 'N/A',
      avatarColorClass: getColorFromString(name, AppConfig.ui.avatarColors),

      // Optional fields
      birthDate: entity.crdfd_birthdate,
      detailedIndustry: entity.crdfd_detailedindustry,
      district: entity['_crdfd_quanhuyen_value@OData.Community.Display.V1.FormattedValue'] || entity.crdfd_district || 'N/A',
      districtId: entity._crdfd_quanhuyen_value,
      city: entity['_crdfd_tinhthanh_value@OData.Community.Display.V1.FormattedValue'] || entity.crdfd_city || 'N/A',
      cityId: entity._crdfd_tinhthanh_value,
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
      notes: entity.cr1bb_note,
    };
  }

  /**
   * Map Lead model back to Dataverse entity (for create/update)
   * NOTE: ProspectiveCustomer table has LIMITED fields compared to Customers table
   * Only map fields that actually exist in crdfd_prospectivecustomer schema
   */
  mapReverse(lead: Lead): Partial<IDataverseProspectiveCustomer> {
    return {
      // Basic fields that exist in ProspectiveCustomer
      crdfd_name: lead.name,
      crdfd_phonenumber: lead.phone !== 'N/A' ? lead.phone : undefined,
      crdfd_email: lead.email !== 'N/A' ? lead.email : undefined,
      crdfd_address: lead.address !== 'N/A' ? lead.address : undefined,
      crdfd_leadsource: mapSourceToDataverse(lead.source),
      crdfd_campaign: lead.campaign !== 'N/A' ? lead.campaign : undefined,
      crdfd_verify: mapLeadStatus(lead.status),
      crdfd_taxcode: lead.taxCode !== 'N/A' ? lead.taxCode : undefined,
      
      // Lookup fields - bind using GUID
      'crdfd_Quanhuyen@odata.bind': lead.districtId ? `/crdfd_quanhuyens(${lead.districtId})` : undefined,
      'crdfd_Tinhthanh@odata.bind': lead.cityId ? `/crdfd_tinhthanhs(${lead.cityId})` : undefined,
      
      // NOTE: crdfd_verify is NOT included here because:
      // - ProspectiveCustomer uses different status values (191920000-191920004)
      // - Status updates should be handled separately by Marketing service

      // NOTE: The following fields do NOT exist in crdfd_prospectivecustomer:
      // - crdfd_city, crdfd_district (use lookup fields instead)
      // - crdfd_tradename, crdfd_supervisor, crdfd_salesstaff, crdfd_debtstaff
      // - crdfd_birthdate, crdfd_paymentterms
      // - crdfd_keyindustry, crdfd_subindustry
      // - crdfd_initialpotential, crdfd_initialgeneralinfo, crdfd_repdescription
      // These fields are only available in crdfd_customers table
    };
  }
}
