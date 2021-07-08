import { KeystoneContext } from "@keystone-next/types";
import stripe from "../lib/stripe";

export default async function checkout(
  root: any,
  { token }: { token: string },
  context: KeystoneContext
): Promise<any> {
  // 1. Make sure the user is signed in
  const userId = context.session.itemId;
  if (!userId) throw new Error("You must be logged in to do this!");
  const user = await context.lists.User.findOne({
    where: { id: userId },
    resolveFields: `
        id
        name 
        email
        cart {
          id
          quantity
          product {
            name
            description
            price
            photo {
              id 
              image {
                id
                publicUrlTransformed
              }
            }
          }
        }
    `,
  });

  // 2 calc the total price for their order
  const cartItems = user.cart.filter((cartItem: any) => cartItem.product);
  const amount = cartItems.reduce((tally: number, cartItem: any) => {
    return tally + cartItem.quantity * cartItem.product.price;
  }, 0);

  // 3. create the payment with the stripe library
  const paymentIntent = await stripe.paymentIntents
    .create({
      amount: amount,
      currency: "inr",
      confirm: true,
      payment_method: token,
    })
    .catch((err) => {
      console.log(err);
      throw new Error(err.message);
    });

  // 4. Convert the cartItems to OrderItems
  const orderItems = cartItems.map((cartItem: any) => {
    const orderItem = {
      name: cartItem.product.name,
      description: cartItem.product.decription,
      price: cartItem.quantity * cartItem.product.price,
      photo: { connect: { id: cartItem.product.photo.id } },
      quantity: cartItem.quantity,
    };
    return orderItem;
  });

  // 5. Create the order and return it
  const order = await context.lists.Order.createOne({
    data: {
      total: paymentIntent.amount,
      charge: paymentIntent.id,
      items: { create: orderItems },
      user: { connect: { id: context.session.itemId } },
    },
  });

  // 6. Clean up any old cart item
  const cartItemIds = user.cart.map((cartItem: any) => cartItem.id);
  await context.lists.CartItem.deleteMany({
    ids: cartItemIds,
  });
  return order;
}
