// src/types/account.ts
export type ImapAccount = {
  user: string;
  password: string;
  host: string;
  port: number;
  tls: boolean;
};
