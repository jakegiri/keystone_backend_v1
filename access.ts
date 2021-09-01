import { permissionsList } from "./schema/fields";
import { ListAccessArgs, PermissionName } from "./types";

//==============  TYPES =====================
type GeneratedPermissions = {
  [key in PermissionName]: ({ session }: ListAccessArgs) => boolean;
};
type StaticPermissions = {
  [key: string]: ({ session }: ListAccessArgs) => boolean;
};
type ImperativePermissions = {
  [key: string]: ({ session }: ListAccessArgs) => boolean | {}; //boolean or where filter clause
};

//##################################################################
//############## TRIED TO CONVERT IT IN CLASS ######################
//##################################################################
//##################################################################

class AccessControls {
  private _generatedStaticPermissionRules: GeneratedPermissions =
    Object.fromEntries(
      permissionsList.map((PermissionName: PermissionName) => [
        PermissionName,
        ({ session }) => !!session?.data.role?.[PermissionName],
      ])
    ) as GeneratedPermissions;

  isSignedIn = ({ session }: ListAccessArgs) => !!session;

  staticPermissionsRules = {
    ...this._generatedStaticPermissionRules,
    //you can add more own static-permission-rules here
  };

  ImperativePermissionRules = {
    canManageProducts: ({ session }: ListAccessArgs) => {
      if (!this.isSignedIn({ session })) {
        return false;
      }
      // 1. Do they have persmission of canManageProducts
      if (this.staticPermissionsRules.canManageProducts({ session })) {
        return true;
      }
      // 2. If not, do they own this item?
      return { user: { id: session?.itemId } };
    },
    canOrder: ({ session }: ListAccessArgs) => {
      if (!this.isSignedIn({ session })) {
        return false;
      }
      //1. Do they have persmission of canManageProducts
      if (this.staticPermissionsRules.canManageRoles({ session })) {
        return true;
      }
      //2. If not, do they own this
      return { user: { id: session?.itemId } };
    },
    canManageOrderItems: ({ session }: ListAccessArgs) => {
      if (!this.isSignedIn({ session })) {
        return false;
      }
      //1. Do they have permission of canManageProducts
      if (this.staticPermissionsRules.canManageProducts({ session })) {
        return true;
      }
      //2. If not, do they own this?
      return { order: { user: { id: session?.itemId } } };
    },
    canReadProducts: ({ session }: ListAccessArgs) => {
      // if (!this.isSignedIn({ session })) {
      //   return false;
      // }
      //1. Do they have persmission of canManageProducts (they can read everything)
      if (this.staticPermissionsRules.canManageProducts({ session })) {
        return true;
      }
      //2. They should only see available products (based on status field)
      return { status: "AVAILABLE" };
    },
    canManageUsers: ({ session }: ListAccessArgs) => {
      if (!this.isSignedIn({ session })) {
        return false;
      }
      //1. Do they have permission of canManageUsers?
      if (this.staticPermissionsRules.canManageUsers({ session })) {
        return true;
      }
      //. If not, do they own this item?
      return { id: session?.itemId };
    },
    canReadRoles: ({ session }: ListAccessArgs) => {
      if (!this.isSignedIn({ session })) {
        return false;
      }
      // Do they have permission to manageRoles?
      if (this.staticPermissionsRules.canManageRoles({ session })) {
        return true;
      }
      // If not, do they own this item?
      return { assignedTo: { some: { id: session?.itemId } } };
    },
  };
}

export const accessControls = new AccessControls();

// //###########################################################
// //#############        WES BOS        #######################
// //###########################################################
// //###########################################################

// export function isSignedIn({ session }: ListAccessArgs) {
//   return !!session;
// }

// const _generatedStaticPermissionRules: GeneratedPermissions =
//   Object.fromEntries(
//     permissionsList.map((PermissionName: PermissionName) => [
//       PermissionName,
//       ({ session }) => !!session?.data.role?.[PermissionName],
//     ])
//   ) as GeneratedPermissions;

// // Permissions check - someone meets a criteria - yes or no
// export const staticPermissionsRules = {
//   ..._generatedStaticPermissionRules,
//   //you can add more own static-permission-rules here
// };

// // Rule based function
// export const ImperativePermissionRules = {
//   canManageProducts({ session }: ListAccessArgs) {
//     // 1. Do they have persmission of canManageProducts
//     if (staticPermissionsRules.canManageProducts({ session })) {
//       return true;
//     }
//     // 2. If not, do they own this item?
//     return { user: { id: session?.itemId } };
//   },
//   canReadProducts({ session }: ListAccessArgs) {
//     if (staticPermissionsRules.canManageProducts({ session })) return true;
//     return { status: "AVAILABLE" };
//   },
// };
