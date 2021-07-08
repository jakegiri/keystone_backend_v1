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

export const lists = createSchema({
  User: list({
    ui: {
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
      role: relationship({ ref: "Role.assignedTo" }),
    },
  }),
  Product: list({
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
          cloudName: process.env.CLOUDINARY_CLOUD_NAME,
          apiKey: process.env.CLOUDINARY_API_KEY,
          apiSecret: process.env.CLOUDINARY_API_SECRET,
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
    fields: {
      total: integer(),
      charge: text(),
      items: relationship({ ref: "OrderItem.order", many: true }),
      user: relationship({ ref: "User.orders" }),
    },
  }),
  Role: list({
    fields: {
      name: text({ isRequired: true }),
      ...permissionFields,
      assignedTo: relationship({
        ref: "User.role",
        many: true,
        ui: {
          itemView: { fieldMode: "read" },
        },
      }),
    },
  }),
});
