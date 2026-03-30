export interface InspectorOptions {
    url?: string;
    command?: string;
    args?: string[];
}
export interface ServerCapabilities {
    name: string;
    version: string;
    tools: Array<{
        name: string;
        description?: string;
        inputSchema?: Record<string, unknown>;
    }>;
    resources: Array<{
        uri: string;
        name: string;
        description?: string;
        mimeType?: string;
    }>;
    prompts: Array<{
        name: string;
        description?: string;
    }>;
}
export declare function inspectServer(opts: InspectorOptions): Promise<ServerCapabilities>;
