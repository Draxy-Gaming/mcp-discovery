import { readFileSync } from 'fs';
import { McpDiscoverySchema } from './schema.js';
export function validateFile(filePath) {
    let raw;
    try {
        raw = JSON.parse(readFileSync(filePath, 'utf8'));
    }
    catch {
        return { valid: false, errors: [`Cannot read: ${filePath}`] };
    }
    const result = McpDiscoverySchema.safeParse(raw);
    if (result.success)
        return { valid: true, errors: [] };
    return {
        valid: false,
        errors: result.error.issues.map((e) => `${e.path.join('.')}: ${e.message}`),
    };
}
