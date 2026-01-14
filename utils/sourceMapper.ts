/**
 * Source Mapper Utility
 * Map between source names and Dataverse option set values
 */

/**
 * Map source string to Dataverse option set value
 * These values should match your Dataverse crdfd_leadsource option set
 */
export const mapSourceToDataverse = (source: string): number | undefined => {
  switch (source) {
    case 'Facebook Ads':
      return 191920000;
    case 'TikTok Ads':
      return 191920001;
    case 'Google Ads':
      return 191920002;
    case 'Facebook Messenger Organic':
    case 'FB Messenger':
      return 191920003;
    case 'Zalo':
      return 191920004;
    case 'Website Form':
      return 191920005;
    case 'Other':
      return 191920006;
    default:
      return undefined;
  }
};

/**
 * Map Dataverse option set value to source string
 */
export const mapDataverseToSource = (value?: number): string => {
  switch (value) {
    case 191920000:
      return 'Facebook Ads';
    case 191920001:
      return 'TikTok Ads';
    case 191920002:
      return 'Google Ads';
    case 191920003:
      return 'Facebook Messenger Organic';
    case 191920004:
      return 'Zalo';
    case 191920005:
      return 'Website Form';
    case 191920006:
      return 'Other';
    default:
      return 'Unknown';
  }
};
