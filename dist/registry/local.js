import { execSync } from 'child_process';
export function discoverLocal() {
    try {
        const output = execSync('npm list -g --depth=0 --json', { encoding: 'utf8', stdio: 'pipe' });
        const data = JSON.parse(output);
        const servers = [];
        for (const name of Object.keys(data.dependencies || {})) {
            const nameLower = name.toLowerCase();
            if (nameLower.includes('mcp') || nameLower.includes('modelcontextprotocol')) {
                servers.push({
                    name,
                    version: data.dependencies[name].version || '0.0.0',
                    description: data.dependencies[name].description || '',
                    source: 'local',
                    keywords: data.dependencies[name].keywords || [],
                    installCommand: `npm install -g ${name}`,
                    homepage: data.dependencies[name].homepage,
                    weeklyDownloads: undefined, // Not available locally
                });
            }
        }
        return servers;
    }
    catch (error) {
        // If npm list fails, just return empty array
        return [];
    }
}
