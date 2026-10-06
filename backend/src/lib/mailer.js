import nodemailer from "nodemailer";
import { ENV } from "./env.js";

export const mailer = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: ENV.EMAIL_USER,
    clientId: ENV.GOOGLE_CLIENT_ID,
    clientSecret: ENV.GOOGLE_CLIENT_SECRET,
    refreshToken: ENV.GOOGLE_REFRESH_TOKEN,
  },
});

export const sender = {
  email: ENV.EMAIL_USER,
  name: ENV.EMAIL_FROM_NAME || "Chatify",
};

export const assertMailerConfig = () => {
  if (!ENV.GOOGLE_CLIENT_ID || !ENV.GOOGLE_CLIENT_SECRET || !ENV.GOOGLE_REFRESH_TOKEN) {
    throw new Error("Gmail OAuth2 is not configured. Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN in backend/.env");
  }
};
