import sgMail from "@sendgrid/mail";

import "dotenv/config";

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

const makeNiceEmail = (text: string) => {
  return `
    <div style="
      border: 1px solid black;
      padding: 20px;
      font-family: sans-serif;
      line-height: 2;
      font-size: 20px;
    ">
      <h2>Hello There!</h2>
      <p>${text}</p>
    </div>
  `;
};

export async function sendPasswordResetEmail(resetToken: string, to: string) {
  console.log("hihihihihh---");
  const msg = {
    to,
    from: "neelunstp@gmail.com",
    subject: "Your Password Reset Token",
    text: "checking where text option goes!",
    html: makeNiceEmail(`
      Your Password Reset Token Is Here!
      <a href="${process.env.FRONTEND_URL}/resetForgetPassword?token=${resetToken}">CLICK HERE TO RESET YOUR PASSWORD</a>
    `),
  };

  try {
    await sgMail.send(msg);
  } catch (error) {
    console.log(error);
    if (error.response) {
      console.log(error.response.body);
    }
  }
}

// import { createTransport } from "nodemailer";

// import "dotenv/config";

// const transporter = createTransport({
//   host: process.env.MAIL_HOST,
//   port: process.env.MAIL_PORT,
//   auth: {
//     user: process.env.MAIL_USER,
//     pass: process.env.MAIL_PASS,
//   },
// });

// const makeNiceEmail = (text: string) => {
//   return `
//     <div style="
//       border: 1px solid black;
//       padding: 20px;
//       font-family: sans-serif;
//       line-height: 2;
//       font-size: 20px;
//     ">
//       <h2>Hello There!</h2>
//       <p>${text}</p>
//     </div>
//   `;
// };

// export async function sendPasswordResetEmail(resetToken: string, to: string) {
//   const info = await transporter.sendMail({
//     from: "specter@specter.com",
//     to,
//     subject: "Your Password reset token",
//     text: "Helo to myself",
//     html: makeNiceEmail(`
//       Your password reset token is here!
//       <a href="${process.env.FRONTEND_URL}/resetForgetPassword?token=${resetToken}"}>Click here to reset</a>
//     `),
//   });
// }
