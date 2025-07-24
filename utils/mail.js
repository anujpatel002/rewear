// File: utils/mail.js
import nodemailer from 'nodemailer';

export const sendMail = async (to, subject, html) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail', // or any other provider
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject,
    html,
  });
};
