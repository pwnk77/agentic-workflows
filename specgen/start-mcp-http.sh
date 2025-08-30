#!/bin/bash

# Start MCP HTTP Server
cd "/Users/pawanraviee/Documents/GitHub/agentic-workflows/specgen"

echo "Starting MCP HTTP Server on port 3001..."
node mcp-http-server.js &

MCP_PID=$!
echo "MCP HTTP Server started with PID: $MCP_PID"
echo $MCP_PID > mcp-http.pid

echo "MCP HTTP Server is running at http://localhost:3001"
echo "Health check: http://localhost:3001/health"
echo "MCP endpoint: http://localhost:3001/mcp"
echo ""
echo "To stop the server, run: kill $MCP_PID"
echo "Or use: ./stop-mcp-http.sh"