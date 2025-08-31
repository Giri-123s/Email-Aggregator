import express from "express";
import cors from "cors";
import { accounts } from "./config/accounts";
import { startImapClient } from "./email/imapClient";
import { esClient } from "./utils/elasticsearchClient";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 4000;

// Optional test route
app.get("/", (req, res) => {
  res.send("✅ Backend API is running!");
});

// Search emails using Elasticsearch
app.get("/emails", async (req, res) => { 
  try {
    const query = req.query.q as string;
    const account = req.query.account as string;
    const folder = req.query.folder as string;
    const label = req.query.label as string;

    let searchQuery: any = {
      bool: {
        must: []
      }
    };

    // Add text search if query provided
    if (query && query !== "*") {
      searchQuery.bool.must.push({
        multi_match: {
          query: query,
          fields: ["subject", "text", "from", "to"]
        }
      });
    }

    // Add filters
    if (account) {
      searchQuery.bool.must.push({ term: { account } });
    }
    if (folder) {
      searchQuery.bool.must.push({ term: { folder } });
    }
    if (label) {
      searchQuery.bool.must.push({ term: { label } });
    }

    const response = await esClient.search({
      index: "emails",
      query: searchQuery,
      sort: [{ date: { order: "desc" } }],
      size: 50
    });

    const emails = response.hits.hits.map((hit: any) => ({
      id: hit._id,
      ...hit._source
    }));

    res.json(emails);
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ error: "Search failed" });
  }
});

// Get email statistics
app.get("/stats", async (req, res) => {
  try {
    const response = await esClient.search({
      index: "emails",
      aggs: {
        by_label: {
          terms: { field: "label.keyword" }
        },
        by_account: {
          terms: { field: "account.keyword" }
        },
        by_folder: {
          terms: { field: "folder.keyword" }
        }
      },
      size: 0
    });

    const aggregations = response.aggregations as any;
    res.json({
      labels: aggregations?.by_label?.buckets || [],
      accounts: aggregations?.by_account?.buckets || [],
      folders: aggregations?.by_folder?.buckets || []
    });
  } catch (error) {
    console.error("Stats error:", error);
    console.error("Error details:", JSON.stringify(error, null, 2));
    res.status(500).json({ error: "Failed to get statistics", details: (error as Error).message });
  }
});

// Get filtered email statistics
app.get("/stats/filtered", async (req, res) => {
  try {
    const query = req.query.q as string;
    const account = req.query.account as string;
    const folder = req.query.folder as string;
    const label = req.query.label as string;

    let searchQuery: any = {
      bool: {
        must: []
      }
    };

    // Add text search if query provided
    if (query && query !== "*") {
      searchQuery.bool.must.push({
        multi_match: {
          query: query,
          fields: ["subject", "text", "from", "to"]
        }
      });
    }

    // Add filters
    if (account) {
      searchQuery.bool.must.push({ term: { account } });
    }
    if (folder) {
      searchQuery.bool.must.push({ term: { folder } });
    }
    if (label) {
      searchQuery.bool.must.push({ term: { label } });
    }

    const response = await esClient.search({
      index: "emails",
      query: searchQuery,
      aggs: {
        by_label: {
          terms: { field: "label.keyword" }
        },
        total_count: {
          value_count: { field: "_id" }
        }
      },
      size: 0
    });

    const aggregations = response.aggregations as any;
    res.json({
      labels: aggregations?.by_label?.buckets || [],
      total: aggregations?.total_count?.value || 0
    });
  } catch (error) {
    console.error("Filtered stats error:", error);
    console.error("Error details:", JSON.stringify(error, null, 2));
    res.status(500).json({ error: "Failed to get filtered statistics", details: (error as Error).message });
  }
});

// Get accounts
app.get("/accounts", (req, res) => {
  res.json(accounts.map(acc => ({ 
    user: acc.user, 
    host: acc.host 
  })));
});

// Get folders
app.get("/folders", async (req, res) => {
  try {
    const response = await esClient.search({
      index: "emails",
      aggs: {
        by_folder: {
          terms: { field: "folder.keyword" }
        }
      },
      size: 0
    });

    const aggregations = response.aggregations as any;
    res.json(aggregations?.by_folder?.buckets || []);
  } catch (error) {
    console.error("Folders error:", error);
    console.error("Error details:", JSON.stringify(error, null, 2));
    res.status(500).json({ error: "Failed to get folders", details: (error as Error).message });
  }
});

// async function main() {
//   // Create Elasticsearch index if it doesn't exist
//   try {
//     await esClient.indices.create({
//       index: "emails",
//       mappings: {
//         properties: {
//           account: { type: "keyword" },
//           folder: { type: "keyword" },
//           from: { type: "text" },
//           to: { type: "text" },
//           subject: { type: "text" },
//           date: { type: "date" },
//           text: { type: "text" },
//           html: { type: "text" },
//           label: { type: "keyword" }
//         }
//       }
//     });
//     console.log("✅ Elasticsearch index created");
//   } catch (error: any) {
//     if (error.message !== "resource_already_exists_exception") {
//       console.error("Error creating index:", error);
//     }
//   }
async function main() {
  const indexName = "emails";

  // Check if index exists first
  const exists = await esClient.indices.exists({ index: indexName });
  if (!exists) {
    await esClient.indices.create({
      index: indexName,
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
    console.log("✅ Elasticsearch index created");
  } else {
    console.log("ℹ️ Elasticsearch index already exists");
    
    // Clear existing emails to start fresh (optional - remove this if you want to keep existing emails)
    try {
      await esClient.deleteByQuery({
        index: indexName,
        query: {
          match_all: {}
        }
      });
      console.log("🧹 Cleared existing emails to prevent duplicates");
    } catch (error) {
      console.log("ℹ️ No existing emails to clear");
    }
  }

  await Promise.all(accounts.map((acc) => startImapClient(acc)));
  
  app.listen(PORT, () => {
    console.log(`🚀 Server is running at http://localhost:${PORT}`);
  });
}

main().catch(console.error);
