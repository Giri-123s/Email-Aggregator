import { esClient } from "../utils/elasticsearchClient";
import { categorizeEmail } from "../utils/categorizeEmail";
import fs from "fs";
import path from "path";
import crypto from "crypto";

// Sample email data to populate the index
const sampleEmails = [
  {
    account: "sample@gmail.com",
    folder: "INBOX",
    from: "john.doe@company.com",
    to: "sample@gmail.com",
    subject: "Interested in Collaboration",
    date: new Date("2024-01-15T10:30:00Z"),
    text: "Hi, I found your solution quite interesting. Let's explore synergies.",
    html: "<p>Hi, I found your solution quite interesting. Let's explore synergies.</p>",
    label: "Interested"
  },
  {
    account: "sample@gmail.com",
    folder: "INBOX",
    from: "jane.smith@startup.com",
    to: "sample@gmail.com",
    subject: "Keen to Know More",
    date: new Date("2024-01-14T14:20:00Z"),
    text: "We are interested in learning more about your offering.",
    html: "<p>We are interested in learning more about your offering.</p>",
    label: "Interested"
  },
  {
    account: "sample@gmail.com",
    folder: "INBOX",
    from: "marketing@competitor.com",
    to: "sample@gmail.com",
    subject: "Special Offer - Limited Time",
    date: new Date("2024-01-13T09:15:00Z"),
    text: "Don't miss out on our exclusive offer! Act now!",
    html: "<p>Don't miss out on our exclusive offer! Act now!</p>",
    label: "Spam"
  },
  {
    account: "sample@gmail.com",
    folder: "INBOX",
    from: "support@service.com",
    to: "sample@gmail.com",
    subject: "Your account has been suspended",
    date: new Date("2024-01-12T16:45:00Z"),
    text: "Click here to verify your account immediately!",
    html: "<p>Click here to verify your account immediately!</p>",
    label: "Spam"
  },
  {
    account: "sample@gmail.com",
    folder: "INBOX",
    from: "alice@techcorp.com",
    to: "sample@gmail.com",
    subject: "Schedule a call",
    date: new Date("2024-01-11T11:30:00Z"),
    text: "We liked your idea. Can we discuss further?",
    html: "<p>We liked your idea. Can we discuss further?</p>",
    label: "Interested"
  },
  {
    account: "sample@gmail.com",
    folder: "INBOX",
    from: "bob@consulting.com",
    to: "sample@gmail.com",
    subject: "Not Interested",
    date: new Date("2024-01-10T13:20:00Z"),
    text: "Thank you for reaching out, but this doesn't fit our current needs.",
    html: "<p>Thank you for reaching out, but this doesn't fit our current needs.</p>",
    label: "Not Interested"
  },
  {
    account: "sample@gmail.com",
    folder: "INBOX",
    from: "sarah@enterprise.com",
    to: "sample@gmail.com",
    subject: "Meeting Booked - Demo Session",
    date: new Date("2024-01-09T15:00:00Z"),
    text: "Your demo session has been scheduled for next Tuesday at 2 PM.",
    html: "<p>Your demo session has been scheduled for next Tuesday at 2 PM.</p>",
    label: "Meeting Booked"
  },
  {
    account: "sample@gmail.com",
    folder: "INBOX",
    from: "david@company.com",
    to: "sample@gmail.com",
    subject: "Out of Office - Vacation",
    date: new Date("2024-01-08T08:00:00Z"),
    text: "I'm currently on vacation and will return on January 15th.",
    html: "<p>I'm currently on vacation and will return on January 15th.</p>",
    label: "Out of Office"
  },
  {
    account: "sample@gmail.com",
    folder: "INBOX",
    from: "emma@startup.com",
    to: "sample@gmail.com",
    subject: "Product looks useful",
    date: new Date("2024-01-07T12:30:00Z"),
    text: "Your tool looks useful for us. Interested to try.",
    html: "<p>Your tool looks useful for us. Interested to try.</p>",
    label: "Interested"
  },
  {
    account: "sample@gmail.com",
    folder: "INBOX",
    from: "mike@enterprise.com",
    to: "sample@gmail.com",
    subject: "Evaluation request",
    date: new Date("2024-01-06T10:15:00Z"),
    text: "We want to evaluate your platform for our use case.",
    html: "<p>We want to evaluate your platform for our use case.</p>",
    label: "Interested"
  }
];

async function populateSampleData() {
  try {
    console.log("🚀 Starting to populate sample email data...");

    // Check if index exists, create if not
    const indexExists = await esClient.indices.exists({ index: "emails" });
    if (!indexExists) {
      await esClient.indices.create({
        index: "emails",
        mappings: {
          properties: {
            account: { type: "keyword" },
            folder: { type: "keyword" },
            from: { type: "text" },
            to: { type: "text" },
            subject: { type: "text" },
            date: { type: "date" },
            text: { type: "text" },
            html: { type: "text" },
            label: { type: "keyword" }
          }
        }
      });
      console.log("✅ Created emails index");
    } else {
      console.log("ℹ️ Emails index already exists");
    }

    // Index each sample email
    for (const email of sampleEmails) {
      // Create unique ID based on email content
      const emailContent = `${email.account}-${email.from}-${email.subject}-${email.date}`;
      const emailId = crypto.createHash('md5').update(emailContent).digest('hex');
      
      try {
        await esClient.index({
          index: "emails",
          id: emailId,
          document: email
        });
        console.log(`✅ Indexed: ${email.subject}`);
      } catch (error) {
        console.error(`❌ Error indexing email: ${email.subject}`, error);
      }
    }

    // Refresh the index to make documents searchable
    await esClient.indices.refresh({ index: "emails" });
    console.log("✅ Index refreshed");

    // Verify the data was indexed
    const countResponse = await esClient.count({ index: "emails" });
    console.log(`📊 Total emails indexed: ${countResponse.count}`);

    console.log("🎉 Sample data population completed successfully!");

  } catch (error) {
    console.error("❌ Error populating sample data:", error);
  }
}

// Run the script
populateSampleData().catch(console.error);
