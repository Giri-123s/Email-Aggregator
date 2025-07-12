// src/services/emailService.ts
import { esClient } from "../utils/elasticsearchClient";
import { categorizeEmail } from "../utils/categorizeEmail";
import { sendSlackNotification, triggerWebhook } from "../utils/notification";
import crypto from "crypto";

export async function indexEmail(account: string, folder: string, email: any) {
  try {
    // Create unique ID based on email content to prevent duplicates
    const emailContent = `${account}-${email.from}-${email.subject}-${email.date}`;
    const emailId = crypto.createHash('md5').update(emailContent).digest('hex');
    
    // Check if email already exists in Elasticsearch
    try {
      const existingEmail = await esClient.get({
        index: "emails",
        id: emailId
      });
      
      console.log(`⏭️ Email already exists: ${email.subject}`);
      return; // Skip if already indexed
    } catch (error: any) {
      // Email doesn't exist, continue with indexing
      if (error.statusCode !== 404) {
        console.error("Error checking existing email:", error);
      }
    }

    // Step 1: Predict category using AI
    const label = await categorizeEmail(email.subject || "", email.text || "");

    // Step 2: Optional integrations for "Interested"
    if (label === "Interested") {
      await sendSlackNotification(email.subject, email.from);
      await triggerWebhook({ ...email, label });
    }

    // Step 3: Index email into Elasticsearch with unique ID
    await esClient.index({
      index: "emails",
      id: emailId, // Use unique ID to prevent duplicates
      document: {
        account,
        folder,
        from: email.from,
        to: email.to,
        subject: email.subject,
        date: email.date,
        text: email.text,
        html: email.html,
        label,
      },
    });

    console.log("Email indexed with label:", label);

  } catch (err) {
    console.error("Error indexing email:", err);
  }
}
