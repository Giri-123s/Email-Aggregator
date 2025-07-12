// src/api/searchEmails.ts
import { esClient } from "../utils/elasticsearchClient";

export async function searchEmails(query: string, account?: string, folder?: string) {
  const result = await esClient.search({
    index: "emails",
    query: {
      bool: {
        must: [
          {
            multi_match: {
              query,
              fields: ["subject", "text", "from", "to"],
            },
          },
        ],
        filter: [
          ...(account ? [{ term: { account } }] : []),
          ...(folder ? [{ term: { folder } }] : []),
        ],
      },
    },
  });

  return result.hits.hits.map((hit: any) => hit._source);
}
