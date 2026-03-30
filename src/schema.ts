import { z } from 'zod';
 
export const ToolSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  inputSchema: z.record(z.string(), z.unknown()).optional(),
});
 
export const ResourceSchema = z.object({
  uri: z.string(),
  name: z.string(),
  description: z.string().optional(),
  mimeType: z.string().optional(),
});
 
export const McpDiscoverySchema = z.object({
  mcpVersion: z.string(),
  name: z.string(),
  description: z.string().optional(),
  homepage: z.string().url().optional(),
  tools: z.array(ToolSchema).optional(),
  resources: z.array(ResourceSchema).optional(),
  prompts: z.array(z.object({
    name: z.string(),
    description: z.string().optional(),
  })).optional(),
  auth: z.object({
    type: z.enum(['none', 'oauth2', 'apikey', 'basic']),
  }).optional(),
  contact: z.object({
    name: z.string().optional(),
    email: z.string().optional(),
    url: z.string().optional(),
  }).optional(),
  generatedAt: z.string(),
});

export type Tool = z.infer<typeof ToolSchema>;
export type Resource = z.infer<typeof ResourceSchema>;
export type McpDiscovery = z.infer<typeof McpDiscoverySchema>;
