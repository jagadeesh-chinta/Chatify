import nodemailer from "nodemailer";
import { ENV } from "./env.js";

export const mailer = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: ENV.EMAIL_USER,
    pass: ENV.EMAIL_APP_PASSWORD, // Gmail App Password (never expires)
  },
});

export const sender = {
  email: ENV.EMAIL_USER,
  name: ENV.EMAIL_FROM_NAME || "Chatify",
};

export const assertMailerConfig = () => {
  if (!ENV.EMAIL_USER || !ENV.EMAIL_APP_PASSWORD) {
    throw new Error(
      "Gmail SMTP is not configured. Set EMAIL_USER and EMAIL_APP_PASSWORD in environment variables."
    );
  }
};
