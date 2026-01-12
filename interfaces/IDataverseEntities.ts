/**
 * Dataverse Entity Interfaces
 * Định nghĩa cấu trúc dữ liệu từ Dataverse API
 */

export interface IDataverseProspectiveCustomer {
  crdfd_prospectivecustomerid: string;
  crdfd_name: string;
  crdfd_phonenumber?: string;
  crdfd_email?: string;
  crdfd_address?: string;
  crdfd_leadsource?: number;
  'crdfd_leadsource@OData.Community.Display.V1.FormattedValue'?: string;
  crdfd_campaign?: string;
  crdfd_verify?: number;
  'crdfd_verify@OData.Community.Display.V1.FormattedValue'?: string;
  crdfd_taxcode?: string;
  crdfd_birthdate?: string;
  crdfd_detailedindustry?: string;
  crdfd_district?: string;
  crdfd_city?: string;
  crdfd_paymentterms?: string;
  crdfd_tradename?: string;
  crdfd_supervisor?: string;
  crdfd_salesstaff?: string;
  crdfd_debtstaff?: string;
  crdfd_initialpotential?: string;
  crdfd_initialgeneralinfo?: string;
  crdfd_repdescription?: string;
  crdfd_keyindustry?: string;
  crdfd_subindustry?: string;
  crdfd_subinfo?: string;
}

export interface IDataverseResponse<T> {
  '@odata.context': string;
  value: T[];
  '@odata.count'?: number;
}

export interface IDataverseQueryOptions {
  top?: number;
  skip?: number;
  filter?: string;
  orderby?: string;
  select?: string[];
}
