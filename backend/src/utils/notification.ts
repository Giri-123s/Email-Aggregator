// src/utils/notification.ts
import axios from "axios";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;
const WEBHOOK_SITE_URL = process.env.WEBHOOK_SITE_URL;

export async function sendSlackNotification(subject: string, from: string) {
  if (!SLACK_WEBHOOK_URL) {
    console.error("SLACK_WEBHOOK_URL not configured");
    return;
  }
  
  try {
    await axios.post(SLACK_WEBHOOK_URL, {
      text: `📬 *Interested Email*\n*Subject:* ${subject}\n*From:* ${from}`,
    });
  } catch (err) {
    console.error("Slack notification error:", err);
  }
}

export async function triggerWebhook(data: any) {
  if (!WEBHOOK_SITE_URL) {
    console.error("WEBHOOK_SITE_URL not configured");
    return;
  }
  
  try {
    await axios.post(WEBHOOK_SITE_URL, data);
  } catch (err) {
    console.error("Webhook trigger error:", err);
  }
}
