import { MCPIndex, SearchResult, RegistryServer } from './types.js';

function scoreServer(server: RegistryServer, query: string): number {
  const q = query.toLowerCase();
  let score = 0;

  const name = server.name.toLowerCase();
  const desc = server.description.toLowerCase();
  const keywords = server.keywords.map(k => k.toLowerCase());

  // Exact name match: highest
  if (name === q) score += 100;

  // Name contains query: high
  if (name.includes(q)) score += 50;

  // Description contains: medium
  if (desc.includes(q)) score += 20;

  // Keyword exact match: medium
  if (keywords.some(k => k === q)) score += 20;

  // Keyword contains: low
  if (keywords.some(k => k.includes(q))) score += 10;

  // Local source bonus
  if (server.source === 'local') score += 5;

  // Downloads bonus
  if ((server.weeklyDownloads || 0) > 1000) score += 5;

  return score;
}

export function searchIndex(index: MCPIndex, query: string): SearchResult {
  const trimmedQuery = query.trim().toLowerCase();

  if (!trimmedQuery) {
    return {
      query,
      totalFound: index.servers.length,
      servers: index.servers,
    };
  }

  const scored = index.servers.map(server => ({
    server,
    score: scoreServer(server, trimmedQuery),
  })).filter(item => item.score > 0);

  scored.sort((a, b) => b.score - a.score);

  return {
    query,
    totalFound: scored.length,
    servers: scored.map(item => item.server),
  };
}