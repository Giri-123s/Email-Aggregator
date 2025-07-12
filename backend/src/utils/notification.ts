// src/utils/notification.ts
import axios from "axios";

const SLACK_WEBHOOK_URL = "https://hooks.slack.com/services/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"; // Replace with your actual URL
const WEBHOOK_SITE_URL = "https://webhook.site/01e83d0c-38b3-4870-959e-6556e202cbb7"; // Replace with your webhook.site link

export async function sendSlackNotification(subject: string, from: string) {
  try {
    await axios.post(SLACK_WEBHOOK_URL, {
      text: `📬 *Interested Email*\n*Subject:* ${subject}\n*From:* ${from}`,
    });
  } catch (err) {
    console.error("Slack notification error:", err);
  }
}

export async function triggerWebhook(data: any) {
  try {
    await axios.post(WEBHOOK_SITE_URL, data);
  } catch (err) {
    console.error("Webhook trigger error:", err);
  }
}
