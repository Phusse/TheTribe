import nodemailer from "nodemailer";
import { env } from "../config/env";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async (options: SendEmailOptions): Promise<void> => {
  try {
    await transporter.sendMail({
      from: `"The Tribe" <${env.SMTP_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
    console.log(`📧 Email secretly sent to ${options.to} regarding: ${options.subject}`);
  } catch (error) {
    console.error(`❌ Failed to send email to ${options.to}:`, error);
    // Don't throw the error, we don't want to crash user registration just because an email failed
  }
};
