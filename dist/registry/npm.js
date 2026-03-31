const SEARCH_TERMS = ['mcp-server', 'modelcontextprotocol', '@modelcontextprotocol'];
export async function discoverFromNPM() {
    const servers = new Map();
    for (const term of SEARCH_TERMS) {
        try {
            const url = `https://registry.npmjs.org/-/v1/search?text=${encodeURIComponent(term)}&size=250`;
            const response = await fetch(url);
            if (!response.ok) {
                console.warn(`Failed to fetch npm search for "${term}": ${response.status}`);
                continue;
            }
            const data = await response.json();
            for (const obj of data.objects || []) {
                const pkg = obj.package;
                if (!pkg)
                    continue;
                // Skip if already have this package
                if (servers.has(pkg.name))
                    continue;
                // Check if it looks like an MCP server
                const nameLower = pkg.name.toLowerCase();
                const keywords = pkg.keywords || [];
                const hasMCP = nameLower.includes('mcp') ||
                    keywords.some((k) => k.toLowerCase().includes('mcp') || k.toLowerCase().includes('model-context-protocol'));
                if (!hasMCP)
                    continue;
                const server = {
                    name: pkg.name,
                    version: pkg.version,
                    description: pkg.description || '',
                    source: 'npm',
                    keywords: keywords,
                    installCommand: `npm install -g ${pkg.name}`,
                    homepage: pkg.links?.homepage,
                    weeklyDownloads: obj.downloads?.weekly || 0,
                };
                servers.set(pkg.name, server);
            }
        }
        catch (error) {
            console.warn(`Error searching npm for "${term}":`, error);
        }
    }
    // Convert to array and sort by downloads descending
    const result = Array.from(servers.values());
    result.sort((a, b) => (b.weeklyDownloads || 0) - (a.weeklyDownloads || 0));
    return result;
}
