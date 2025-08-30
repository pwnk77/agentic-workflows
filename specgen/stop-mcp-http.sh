#!/bin/bash

# Stop MCP HTTP Server
cd "/Users/pawanraviee/Documents/GitHub/agentic-workflows/specgen"

if [ -f "mcp-http.pid" ]; then
    MCP_PID=$(cat mcp-http.pid)
    echo "Stopping MCP HTTP Server (PID: $MCP_PID)..."
    kill $MCP_PID
    rm mcp-http.pid
    echo "MCP HTTP Server stopped."
else
    echo "No PID file found. Attempting to kill by process name..."
    pkill -f "node mcp-http-server.js"
    echo "Done."
fi