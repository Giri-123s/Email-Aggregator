// src/config/accounts.ts
import { ImapAccount } from "../types/account";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

export const accounts: ImapAccount[] = [
  {
    user: process.env.EMAIL_USER_1 || "your_email_1@gmail.com",
    password: process.env.EMAIL_PASSWORD_1 || "your_app_password_1",
    host: "imap.gmail.com",
    port: 993,
    tls: true,
  },
  {
    user: process.env.EMAIL_USER_2 || "your_email_2@gmail.com", 
    password: process.env.EMAIL_PASSWORD_2 || "your_app_password_2",
    host: "imap.gmail.com",
    port: 993,
    tls: true,
  },
];
