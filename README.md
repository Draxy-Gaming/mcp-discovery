# mcp-discover

Auto-generate `.well-known/mcp.json` for any MCP server — fills the top-4 capability discovery gap in the MCP 2026 roadmap.

```bash
npx mcp-discover search email
```

## Why

The MCP ecosystem is growing rapidly, but there's no way to discover what servers exist or what they do without manually connecting to each one. This creates a chicken-and-egg problem: developers can't find servers to use, and server authors can't get users.

The MCP 2026 roadmap identifies "capability discovery" as a top-4 priority, but no tool exists to solve it today. mcp-discover changes that by providing a complete developer workflow: search the global registry, inspect server details, generate capability documents, and validate them.

## Commands

### search
Find MCP servers by keyword across npm and your local machine.

```bash
# Search for email servers
npx mcp-discover search email

# Search for GitHub integrations
npx mcp-discover search github

# See all servers
npx mcp-discover search
```

### index
Build and cache the server index (runs automatically on first search).

```bash
npx mcp-discover index
```

### inspect
Show detailed information about a specific server.

```bash
npx mcp-discover inspect @modelcontextprotocol/server-everything
```

### generate
Connect to a live MCP server and output its `.well-known/mcp.json`.

```bash
# For stdio servers
npx mcp-discover generate --command "npx @modelcontextprotocol/server-everything"

# For HTTP servers
npx mcp-discover generate --url "http://localhost:3001/mcp"
```

### validate
Check an existing `mcp.json` against the schema.

```bash
npx mcp-discover validate .well-known/mcp.json
```

## Output Format

The generated `mcp.json` follows the emerging `.well-known/mcp.json` standard. See `examples/sample.mcp.json` for a complete example.

## License

MIT