/**
 * Application Configuration
 * Centralized config management
 */

export const AppConfig = {
  dataverse: {
    baseUrl: 'https://wecare-ii.crm5.dynamics.com/api/data/v9.2',
    entityName: 'crdfd_prospectivecustomers',
    defaultPageSize: 50,
    maxPageSize: 100,
  },
  
  api: {
    timeout: 30000, // 30 seconds
    retryAttempts: 3,
    retryDelay: 1000, // 1 second
  },
  
  ui: {
    avatarColors: [
      'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300',
      'bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300',
      'bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-300',
      'bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-300',
      'bg-pink-100 dark:bg-pink-900/40 text-pink-600 dark:text-pink-300',
      'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-600 dark:text-yellow-300',
      'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-300',
      'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300',
    ],
  },
} as const;

export type AppConfigType = typeof AppConfig;
