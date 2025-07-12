// src/utils/elasticsearchClient.ts
import { Client } from "@elastic/elasticsearch";

export const esClient = new Client({
  node: "http://localhost:9200",
});
