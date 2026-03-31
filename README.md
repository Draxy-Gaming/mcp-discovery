# mcp-discover

Discover, search, and inspect MCP servers — and generate `.well-known/mcp.json` capability documents.

```bash
npx mcp-discover search email
npx mcp-discover tools @notionhq/notion-mcp-server
```

## Why

The MCP ecosystem is growing fast but fragmented. There's no way to find what servers exist or understand what they do without manually connecting to each one.

The MCP 2026 roadmap identifies capability discovery as a top-4 priority. No tool existed to solve it. mcp-discover changes that.

## Commands

### search
Find MCP servers by keyword across the entire npm ecosystem.
```bash
npx mcp-discover search email
npx mcp-discover search github
npx mcp-discover search   # list all
```

### tools
See every tool a server exposes — without reading any docs.
```bash
npx mcp-discover tools @notionhq/notion-mcp-server
```
Checks for a published `.well-known/mcp.json` first. If not found, offers to temporarily install and inspect the server, then caches the result so you never wait twice.

### generate
Connect to a live server and generate its `.well-known/mcp.json`.
```bash
npx mcp-discover generate --command mcp-server-everything
npx mcp-discover generate --url http://localhost:3001/mcp
```

### validate
Check an existing mcp.json against the schema.
```bash
npx mcp-discover validate .well-known/mcp.json
```

### inspect
Show registry details about a specific server.
```bash
npx mcp-discover inspect @notionhq/notion-mcp-server
```

### index
Build and cache the local server index manually.
```bash
npx mcp-discover index
npx mcp-discover index --refresh
```

## Shortcut

After global install, use `mcpd` instead of `mcp-discover`:
```bash
npm install -g mcp-discover
mcpd search email
mcpd tools @notionhq/notion-mcp-server
```

## License
MIT
