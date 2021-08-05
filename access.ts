import { permissionsList } from "./schema/fields";
import { ListAccessArgs, PermissionName } from "./types";

//==============  TYPES =====================
type StaticPermissions = {
  [key in PermissionName]: ({ session }: ListAccessArgs) => boolean;
};

type ImperativePermissions = {
  [key in PermissionName]: ({ session }: ListAccessArgs) => any;
};

//===============================================
//===============================================
//===============================================
export function isSignedIn({ session }: ListAccessArgs) {
  return !!session;
}

const generatedPermissions: StaticPermissions = Object.fromEntries(
  permissionsList.map((PermissionName: PermissionName) => [
    PermissionName,
    ({ session }) => !!session?.data.role?.[PermissionName],
  ])
) as StaticPermissions;

// Permissions check - someone meets a criteria - yes or no
// You can add extra permissions too along with generated permissions
export const permissions: StaticPermissions = {
  ...generatedPermissions,
};

// // Rule based function
// export const rules: ImperativePermissions = {
//   canManageProducts({ session }: ListAccessArgs) {
//     // 1. Do they have persmission of canManageProducts
//     if (permissions.canManageProducts({ session })) {
//       return true;
//     }
//     // 2. If not, do they own this item?
//     return { user: { id: session?.itemId } };
//   },
// };
