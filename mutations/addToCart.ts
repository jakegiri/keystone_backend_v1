import { KeystoneContext } from "@keystone-next/types";

export default async function addToCart(
  root: any,
  { productId, quantity = 1 }: { productId: String; quantity: Number },
  context: KeystoneContext
) {
  const sesh = context.session;

  // 1. Query the current user to see if they're signed in
  if (!sesh.itemId) {
    throw new Error("You must be logged in to do this!");
  }

  // 2. Query the current users cart
  const allCartItems = await context.lists.CartItem.findMany({
    where: {
      user: { id: sesh.itemId },
      product: { id: productId },
    },
    query: "id, quantity",
  });
  const [existingCartItem] = allCartItems;

  //3- If the current item is in the cart, increment quantity by one
  if (existingCartItem) {
    return await context.lists.CartItem.updateOne({
      id: existingCartItem.id,
      data: { quantity: existingCartItem.quantity + quantity },
      query: "id, quantity",
    });
  }

  // 4- If the current item isn't in the cart, create a new cartItem
  if (!existingCartItem) {
    return await context.lists.CartItem.createOne({
      data: {
        product: { connect: { id: productId } },
        user: { connect: { id: sesh.itemId } },
        quantity: quantity,
      },
      query: "id, quantity",
    });
  }
}
