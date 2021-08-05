export { PermissionName } from "./schema/fields";
import { PermissionName } from "./schema/fields";

export type Session = {
  itemId: string;
  listKey: string;
  data: {
    name: string;
    role?: {
      id: string;
      name: string;
    } & {
      [key in PermissionName]: boolean;
    };
  };
};

export type ListAccessArgs = {
  itemId?: string;
  session?: Session;
};
