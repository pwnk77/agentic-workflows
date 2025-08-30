# SpecGen MCP Server - Startup Instructions

## Overview
The SpecGen MCP Server provides Model Context Protocol integration with HTTP streaming transport (SSE) for specification file management with SQLite backend.

## Quick Start

### 1. Start the MCP HTTP Server
```bash
cd /Users/pawanraviee/Documents/GitHub/agentic-workflows/specgen
bash start-mcp-http.sh
```

### 2. Verify Server is Running
```bash
curl http://localhost:3001/health
# Should return: {"status":"ok","transport":"http-sse"}
```

### 3. Restart Claude Code
After starting the server, restart Claude Code to establish the MCP connection.

## Server Details

### Endpoints
- **Main MCP Endpoint**: `POST http://localhost:3001/mcp`
- **SSE Connection**: `GET http://localhost:3001/mcp`  
- **Health Check**: `GET http://localhost:3001/health`

### Transport Configuration
- **Type**: HTTP Streaming with Server-Sent Events (SSE)
- **Port**: 3001
- **Protocol**: HTTP (localhost only for security)

## Claude Code Configuration

The MCP server is configured in Claude Code as:
```json
{
  "name": "specgen-mcp",
  "url": "http://localhost:3001/mcp",
  "transport": "sse",
  "scope": "local"
}
```

## Management Commands

### Start Server
```bash
bash start-mcp-http.sh
```

### Stop Server
```bash
bash stop-mcp-http.sh
```

### Check Server Status
```bash
curl http://localhost:3001/health
```

### View Server Logs
```bash
tail -f specgen/logs/combined.log
```

## Troubleshooting

### Server Won't Start
1. Check if port 3001 is available:
   ```bash
   lsof -i :3001
   ```
2. Kill any existing processes on port 3001:
   ```bash
   kill $(lsof -ti:3001)
   ```

### Claude Code Connection Failed  
1. Verify server is running: `curl http://localhost:3001/health`
2. Check server logs for errors
3. Restart Claude Code completely
4. Verify MCP configuration with: `claude mcp list`

### Database Issues
The SQLite database is automatically initialized. If issues persist:
1. Check database file permissions: `ls -la specgen.sqlite`
2. Delete and recreate: `rm specgen.sqlite` then restart server

## Security Notes

- Server binds to `localhost` only (no external access)
- CORS configured for Claude.ai domains
- Origin validation prevents DNS rebinding attacks
- Session management with secure ID generation

## Development

### Dependencies
- Node.js 18+
- @modelcontextprotocol/sdk
- Express.js with CORS
- SQLite3 with TypeORM

### Build Process
```bash
npm install
npm run build
```

### Running in Development
```bash
npm run dev  # Uses nodemon with ts-node
```

## Files Overview

### Core Files
- `mcp-http-server.js` - HTTP streaming MCP server implementation
- `dist/mcp/server.js` - Compiled MCP server manager  
- `specgen.sqlite` - SQLite database file

### Management Scripts
- `start-mcp-http.sh` - Server startup script
- `stop-mcp-http.sh` - Server shutdown script  
- `mcp-http.pid` - Process ID file (auto-generated)

### Configuration
- `package.json` - Node.js dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `mcp-config.json` - MCP server configuration (legacy)

## Next Steps

1. Start the server using the instructions above
2. Restart Claude Code  
3. Verify the `specgen-mcp` server shows as "connected" in Claude Code
4. Begin using MCP tools and resources for specification management