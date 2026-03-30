export function generateDiscovery(capabilities, opts = {}) {
    return {
        mcpVersion: '2025-11-05',
        name: capabilities.name,
        ...(opts.homepage && { homepage: opts.homepage }),
        tools: capabilities.tools.map((t) => ({
            name: t.name,
            ...(t.description && { description: t.description }),
            ...(t.inputSchema && { inputSchema: t.inputSchema }),
        })),
        resources: capabilities.resources.map((r) => ({
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
