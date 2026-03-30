import { readFileSync } from 'fs';
import { McpDiscoverySchema } from './schema.js';
 
export function validateFile(filePath: string) {
  let raw: unknown;
  try {
    raw = JSON.parse(readFileSync(filePath, 'utf8'));
  } catch {
    return { valid: false, errors: [`Cannot read: ${filePath}`] };
  }
  const result = McpDiscoverySchema.safeParse(raw);
  if (result.success) return { valid: true, errors: [] };
  return {
    valid: false,
    errors: result.error.issues.map((e: any) => `${e.path.join('.')}: ${e.message}`),
  };
}

