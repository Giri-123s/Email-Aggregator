// src/email/imapClient.ts
import { ImapFlow } from "imapflow";
import { ImapAccount } from "../types/account";
import { simpleParser } from "mailparser";
import { indexEmail } from "../services/emailService";

export async function startImapClient(account: ImapAccount) {
  const client = new ImapFlow({
    host: account.host,
    port: account.port,
    secure: account.tls,
    auth: {
      user: account.user,
      pass: account.password,
    },
  });

  await client.connect();
  console.log(`✅ Connected: ${account.user}`);

  // Fetch last 30 days
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
  await client.mailboxOpen("INBOX");
  let lastSeenUid = 0;
  
  // Track processed emails to avoid duplicates
  const processedEmails = new Set<string>();

  console.log(`📥 Fetching emails from last 30 days for ${account.user}...`);
  
  // 📨 Fetch and index emails from last 30 days
  for await (let msg of client.fetch({ since }, { uid: true, source: true })) {
    if (msg.source) {
      try {
        const parsed = await simpleParser(msg.source);
        const emailKey = `${account.user}-${msg.uid}`;
        
        // Skip if already processed
        if (processedEmails.has(emailKey)) {
          console.log(`⏭️ Skipping duplicate: ${parsed.subject}`);
          continue;
        }
        
        console.log(`📨 [${account.user}] - ${parsed.subject}`);

        await indexEmail(account.user, "INBOX", {
          from: parsed.from?.text || "",
          to: Array.isArray(parsed.to)
            ? parsed.to.map((addr) => addr.text).join(", ")
            : parsed.to?.text || "",
          subject: parsed.subject || "",
          date: parsed.date || new Date(),
          text: parsed.text || "",
          html: parsed.html || "",
        });

        // Mark as processed
        processedEmails.add(emailKey);
        
        if (msg.uid > lastSeenUid) {
          lastSeenUid = msg.uid;
        }

        console.log(`✅ Indexed: ${parsed.subject}`);
      } catch (err) {
        console.error(`❌ Error indexing email: ${err}`);
      }
    }
  }

  console.log(`✅ Finished indexing existing emails for ${account.user}`);

  // Setup real-time listener for new emails
  client.on("exists", async () => {
    console.log("📥 New email detected");
    try {
      const lock = await client.getMailboxLock("INBOX");
      try {
        const messages = [];
        for await (let msg of client.fetch(`UID ${lastSeenUid + 1}:*`, { uid: true, source: true })) {
          messages.push(msg);
        }
  
        for (const msg of messages) {
          if (msg?.source && msg.uid > lastSeenUid) {
            const parsed = await simpleParser(msg.source);
            const emailKey = `${account.user}-${msg.uid}`;
            
            // Skip if already processed
            if (processedEmails.has(emailKey)) {
              console.log(`⏭️ Skipping duplicate: ${parsed.subject}`);
              continue;
            }
            
            console.log("🧾 Parsed email subject:", parsed.subject);
  
            await indexEmail(account.user, "INBOX", {
              from: parsed.from?.text || "",
              to: Array.isArray(parsed.to)
                ? parsed.to.map((addr) => addr.text).join(", ")
                : parsed.to?.text || "",
              subject: parsed.subject || "",
              date: parsed.date || new Date(),
              text: parsed.text || "",
              html: parsed.html || "",
            });
  
            // Mark as processed
            processedEmails.add(emailKey);
            lastSeenUid = msg.uid; // ✅ update tracker
            console.log("✅ Email indexed to Elasticsearch");
          }
        }
      } finally {
        lock.release();
      }
    } catch (err) {
      console.error("❌ Error handling new message:", err);
    }
  });
  
  // Enter persistent IDLE mode
  client.idle().catch(console.error);
}
