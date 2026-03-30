import type { ServerCapabilities } from './inspector.js';
import type { McpDiscovery } from './schema.js';
export interface GenerateOptions {
    homepage?: string;
    contact?: {
        name?: string;
        email?: string;
        url?: string;
    };
}
export declare function generateDiscovery(capabilities: ServerCapabilities, opts?: GenerateOptions): McpDiscovery;
