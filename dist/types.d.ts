export interface RegistryServer {
    name: string;
    version: string;
    description: string;
    source: "npm" | "local";
    keywords: string[];
    installCommand: string;
    homepage?: string;
    weeklyDownloads?: number;
}
export interface MCPIndex {
    builtAt: string;
    totalServers: number;
    servers: RegistryServer[];
}
export interface SearchResult {
    query: string;
    totalFound: number;
    servers: RegistryServer[];
}
