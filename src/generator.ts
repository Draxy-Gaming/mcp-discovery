import type { ServerCapabilities } from './inspector.js';
import type { McpDiscovery } from './schema.js';
 
export interface GenerateOptions {
  homepage?: string;
  contact?: { name?: string; email?: string; url?: string };
}
 
export function generateDiscovery(
  capabilities: ServerCapabilities,
  opts: GenerateOptions = {}
): McpDiscovery {
  return {
    mcpVersion: '2025-11-05',
    name: capabilities.name,
    ...(opts.homepage && { homepage: opts.homepage }),
    tools: capabilities.tools.map((t: any) => ({
      name: t.name,
      ...(t.description && { description: t.description }),
      ...(t.inputSchema && { inputSchema: t.inputSchema as Record<string,unknown> }),
    })),
    resources: capabilities.resources.map((r: any) => ({
      uri: r.uri, name: r.name,
      ...(r.description && { description: r.description }),
      ...(r.mimeType && { mimeType: r.mimeType }),
    })),
    prompts: capabilities.prompts.map(pr => ({
      name: pr.name,
      ...(pr.description && { description: pr.description }),
    })),
    ...(opts.contact && { contact: opts.contact }),
    generatedAt: new Date().toISOString(),
  };
}

