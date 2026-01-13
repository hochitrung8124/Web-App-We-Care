import { getToken } from '../implicitAuthService';
import { AppConfig } from '../config/app.config';
import { DataverseHttpClient } from './DataverseHttpClient';
import { AuthProvider } from './AuthProvider';

export interface UserRoleInfo {
  isAdmin: boolean;
  isSale: boolean;
  userId: string;
  roles: Array<{ name: string; roleid: string }>;
}

interface WhoAmIResponse {
  UserId: string;
  BusinessUnitId: string;
  OrganizationId: string;
}

interface SystemUserRolesResponse {
  systemuserroles_association: Array<{
    name: string;
    roleid: string;
  }>;
}

export class RoleService {
  private httpClient: DataverseHttpClient;

  constructor() {
    this.httpClient = new DataverseHttpClient(new AuthProvider());
  }

  /**
   * Check if user has admin or sale role
   * @returns UserRoleInfo object with role status and user details
   */
  async checkUserRoles(): Promise<UserRoleInfo> {
    try {
      console.log('👤 Checking user roles...');
      
      // 1. WhoAmI Request to get UserId
      const whoAmIUrl = `${AppConfig.dataverse.baseUrl}/WhoAmI`;
      const whoAmIData = await this.httpClient.get<WhoAmIResponse>(whoAmIUrl);
      const userId = whoAmIData.UserId;
      
      console.log('🆔 User ID:', userId);

      // 2. Get User Roles
      const rolesUrl = `${AppConfig.dataverse.baseUrl}/systemusers(${userId})?$expand=systemuserroles_association($select=name,roleid)`;
      
      try {
        const rolesData = await this.httpClient.get<SystemUserRolesResponse>(rolesUrl);
        console.log('👮 User Roles Data:', rolesData);
        
        const userRoles = rolesData.systemuserroles_association || [];
        let foundAdmin = false;
        let foundSale = false;
        
        userRoles.forEach((role: any) => {
          console.log(`Role: ${role.name}, ID: ${role.roleid}`);
          
          // Check Admin by role ID
          if (AppConfig.roles.admins.includes(role.roleid)) {
            foundAdmin = true;
          }
          
          // Check Sale by role ID or role name
          if (AppConfig.roles.sales.includes(role.roleid) || role.name === 'Sale_Permission') {
            foundSale = true;
          }
        });

        if (foundAdmin) {
          console.log('👑 User is Admin - Can choose department');
        } else if (foundSale) {
          console.log('💼 User is Sale - Auto-login to Sale department');
        } else {
          console.log('👤 User has no special role');
        }

        return {
          isAdmin: foundAdmin,
          isSale: foundSale && !foundAdmin, // Only set isSale if NOT admin
          userId,
          roles: userRoles
        };
      } catch (roleError) {
        // If user doesn't have permission to read systemusers, default to allowing selection
        console.log('ℹ️ User roles not accessible. Allowing department selection.');
        return {
          isAdmin: true, // Allow them to choose
          isSale: false,
          userId,
          roles: []
        };
      }

    } catch (error) {
      console.error('❌ Error checking user roles:', error);
      throw error;
    }
  }
}

export const roleService = new RoleService();
