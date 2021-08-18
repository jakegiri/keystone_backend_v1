import { createSchema, list } from "@keystone-next/keystone/schema";
import {
  text,
  password,
  select,
  integer,
  relationship,
} from "@keystone-next/fields";
import { cloudinaryImage } from "@keystone-next/cloudinary";
import "dotenv/config";
import { permissionFields } from "./schema/fields";
import { accessControls } from "./access";

export const lists = createSchema({
  User: list({
    access: {
      create: () => true,
      read: accessControls.ImperativePermissionRules.canManageUsers,
      update: accessControls.ImperativePermissionRules.canManageUsers,
      delete: accessControls.staticPermissionsRules.canManageUsers,
    },
    ui: {
      hideCreate: ({ session }) =>
        !accessControls.staticPermissionsRules.canManageUsers({ session }),
      hideDelete: ({ session }) =>
        !accessControls.staticPermissionsRules.canManageUsers({ session }),
      listView: {
        initialColumns: ["name", "email", "cart"],
      },
    },
    fields: {
      name: text({ isRequired: true }),
      email: text({ isRequired: true, isUnique: true }),
      password: password({ isRequired: true }),
      cart: relationship({
        ref: "CartItem.user",
        many: true,
        ui: {
          createView: { fieldMode: "hidden" },
          itemView: { fieldMode: "read" },
        },
      }),
      orders: relationship({ ref: "Order.user", many: true }),
      role: relationship({
        access: {
          create: accessControls.staticPermissionsRules.canManageUsers,
          update: accessControls.staticPermissionsRules.canManageUsers,
        },
        ref: "Role.assignedTo",
      }),
      products: relationship({
        ref: "Product.user",
        many: true,
      }),
    },
  }),
  Product: list({
    access: {
      create: accessControls.isSignedIn,
      read: accessControls.ImperativePermissionRules.canReadProducts,
      delete: accessControls.ImperativePermissionRules.canManageProducts,
      update: accessControls.ImperativePermissionRules.canManageProducts,
    },
    fields: {
      name: text({ isRequired: true }),
      description: text({
        ui: {
          displayMode: "textarea",
        },
      }),
      status: select({
        options: [
          { label: "Draft", value: "DRAFT" },
          { label: "Available", value: "AVAILABLE" },
          { label: "Unavailable", value: "UNAVAILABLE" },
        ],
        defaultValue: "DRAFT",
        ui: {
          displayMode: "segmented-control",
          createView: { fieldMode: "hidden" },
        },
      }),
      price: text(),
      photo: relationship({
        ref: "ProductImage.product",
        ui: {
          displayMode: "cards",
          cardFields: ["image", "altText"],
          inlineCreate: { fields: ["image", "altText"] },
          inlineEdit: { fields: ["image", "altText"] },
        },
      }),
      user: relationship({
        ref: "User.products",
        defaultValue: ({ context }) => ({
          connect: { id: context.session.itemId },
        }),
      }),
    },
    // hooks: {
    //   beforeDelete: async ({ existingItem, context }) => {
    //     context.lists.
    //   },
    // },
  }),
  ProductImage: list({
    fields: {
      image: cloudinaryImage({
        cloudinary: {
          cloudName: process.env.CLOUDINARY_CLOUD_NAME!,
          apiKey: process.env.CLOUDINARY_API_KEY!,
          apiSecret: process.env.CLOUDINARY_API_SECRET!,
          folder: "sickfits",
        },
      }),
      altText: text(),
      product: relationship({ ref: "Product.photo" }),
    },
    ui: {
      listView: {
        initialColumns: ["image", "altText", "product"],
      },
    },
  }),
  CartItem: list({
    access: {
      create: accessControls.isSignedIn,
      read: accessControls.ImperativePermissionRules.canOrder,
      update: accessControls.ImperativePermissionRules.canOrder,
      delete: accessControls.ImperativePermissionRules.canOrder,
    },
    ui: {
      listView: {
        initialColumns: ["product", "quantity", "user"],
      },
    },
    fields: {
      quantity: integer({
        defaultValue: 1,
        isRequired: true,
      }),
      product: relationship({ ref: "Product" }),
      user: relationship({ ref: "User.cart" }),
    },
  }),
  OrderItem: list({
    access: {
      create: accessControls.isSignedIn,
      read: accessControls.ImperativePermissionRules.canReadProducts,
      update: false,
      delete: false,
    },
    fields: {
      name: text({ isRequired: true }),
      description: text({
        ui: {
          displayMode: "textarea",
        },
      }),
      price: integer(),
      photo: relationship({
        ref: "ProductImage",
        ui: {
          displayMode: "cards",
          cardFields: ["image", "altText"],
          inlineCreate: { fields: ["image", "altText"] },
          inlineEdit: { fields: ["image", "altText"] },
        },
      }),
      quantity: integer(),
      order: relationship({ ref: "Order.items" }),
    },
  }),
  Order: list({
    access: {
      create: accessControls.isSignedIn,
      read: accessControls.ImperativePermissionRules.canOrder,
      update: false,
      delete: false,
    },
    fields: {
      total: integer(),
      charge: text(),
      items: relationship({ ref: "OrderItem.order", many: true }),
      user: relationship({
        ref: "User.orders",
        ui: {
          itemView: { fieldMode: "read" },
        },
      }),
    },
  }),
  Role: list({
    access: {
      create: accessControls.staticPermissionsRules.canManageRoles,
      read: accessControls.ImperativePermissionRules.canReadRoles,
      update: accessControls.staticPermissionsRules.canManageRoles,
      delete: accessControls.staticPermissionsRules.canManageRoles,
    },
    ui: {
      isHidden: ({ session }) =>
        !accessControls.staticPermissionsRules.canManageRoles({ session }),
      hideCreate: ({ session }) =>
        !accessControls.staticPermissionsRules.canManageRoles({ session }),
      hideDelete: ({ session }) =>
        !accessControls.staticPermissionsRules.canManageRoles({ session }),
    },
    fields: {
      name: text({ isRequired: true }),
      ...permissionFields,
      assignedTo: relationship({
        ref: "User.role",
        many: true,
      }),
    },
  }),
});
