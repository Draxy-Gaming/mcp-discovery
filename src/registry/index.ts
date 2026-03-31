import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';
import { RegistryServer, MCPIndex } from '../types.js';
import { discoverFromNPM } from './npm.js';
import { discoverLocal } from './local.js';

const CACHE_DIR = join(homedir(), '.mcp-discover');
const CACHE_FILE = join(CACHE_DIR, 'index.json');
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

export function getCachePath(): string {
  return CACHE_FILE;
}

export async function buildIndex(forceRefresh = false): Promise<MCPIndex> {
  // Try to load from cache if not forcing refresh
  if (!forceRefresh && existsSync(CACHE_FILE)) {
    try {
      const cached = JSON.parse(readFileSync(CACHE_FILE, 'utf8')) as MCPIndex;
      const age = Date.now() - new Date(cached.builtAt).getTime();
      if (age < CACHE_TTL_MS) {
        return cached;
      }
    } catch (error) {
      // Cache corrupted, rebuild
    }
  }

  // Build fresh index
  const [npmServers, localServers] = await Promise.all([
    discoverFromNPM(),
    discoverLocal(),
  ]);

  // Merge with Map: npm first, then local
  const servers = new Map<string, RegistryServer>();
  for (const server of npmServers) {
    servers.set(server.name, server);
  }
  for (const server of localServers) {
    if (servers.has(server.name)) {
      // Update source to local if already exists
      servers.get(server.name)!.source = 'local';
    } else {
      servers.set(server.name, server);
    }
  }

  const index: MCPIndex = {
    builtAt: new Date().toISOString(),
    totalServers: servers.size,
    servers: Array.from(servers.values()),
  };

  // Save to cache
  mkdirSync(CACHE_DIR, { recursive: true });
  writeFileSync(CACHE_FILE, JSON.stringify(index, null, 2));

  return index;
}