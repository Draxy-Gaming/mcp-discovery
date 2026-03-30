import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
export async function inspectServer(opts) {
    const client = new Client({ name: 'mcp-discover', version: '0.1.0' });
    let transport;
    if (opts.url) {
        transport = new StreamableHTTPClientTransport(new URL(opts.url));
    }
    else if (opts.command) {
        transport = new StdioClientTransport({
            command: opts.command,
            args: opts.args ?? [],
        });
    }
    else {
        throw new Error('Provide either --url or --command');
    }
    await client.connect(transport);
    const [toolsResult, resourcesResult, promptsResult] = await Promise.all([
        client.listTools().catch(() => ({ tools: [] })),
        client.listResources().catch(() => ({ resources: [] })),
        client.listPrompts().catch(() => ({ prompts: [] })),
    ]);
    const info = client.getServerVersion();
    await client.close();
    return {
        name: info?.name ?? 'Unknown Server',
        version: info?.version ?? '0.0.0',
        tools: toolsResult.tools ?? [],
        resources: resourcesResult.resources ?? [],
        prompts: promptsResult.prompts ?? [],
    };
}
