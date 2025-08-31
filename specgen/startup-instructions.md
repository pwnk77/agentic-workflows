# SpecGen Interactive Dashboard - Complete Setup & Usage Guide

## 🎯 Overview
SpecGen now provides a complete interactive web dashboard with real-time collaboration features, advanced search, and rich markdown editing capabilities - all integrated with the Model Context Protocol (MCP) for seamless Claude integration.

## ⚡ Quick Start - Interactive Dashboard

### 1. Launch via MCP Tool (Recommended)
The easiest way to start the dashboard:
```
launch_dashboard
```
- Default port: 3001
- Auto-opens browser
- Customizable: `launch_dashboard {"port": 4000, "open_browser": false}`

### 2. Launch via Command Line
```bash
cd /Users/pawanraviee/Documents/GitHub/agentic-workflows/specgen
node build/index.js --mode dashboard --port 3001
```

### 3. Access the Dashboard
Open your browser to: **http://localhost:3001/dashboard**

## 🌟 Dashboard Features

### ✨ **Interactive Features**
- **📝 Rich Markdown Editor**: Monaco Editor with syntax highlighting and live preview
- **🔄 Real-time Collaboration**: WebSocket updates across all connected clients
- **🔍 Advanced Search**: Full-text search with FTS5 and BM25 ranking
- **📊 Live Analytics**: Real-time dashboard statistics and activity tracking
- **⌨️ Keyboard Shortcuts**: Cmd/Ctrl+S to save, Cmd/Ctrl+P to toggle preview

### 🎨 **Modern UI Components**
- **Responsive Design**: Mobile-first Tailwind CSS styling
- **Status Management**: Visual status indicators (Draft, Todo, In-Progress, Done)
- **Activity Feeds**: Recent changes and activity summaries
- **Search Highlights**: Snippet highlighting with relevance scores

## 🔧 Server Modes & Usage

### 1. **Dashboard Mode** (Interactive Web Interface)
```bash
# Via MCP tool
launch_dashboard

# Via command line
node build/index.js --mode dashboard --port 3001

# With custom settings
DASHBOARD_PORT=4000 DASHBOARD_AUTO_OPEN=false node build/index.js --mode dashboard
```

### 2. **MCP Mode** (Claude Integration Only)
```bash
node build/index.js --mode mcp
```
- Provides MCP tools for Claude without web interface
- Stdio transport for direct Claude integration

### 3. **Integrated Mode** (Both Web + MCP)
```bash
node build/index.js --mode integrated --port 3000
```
- Runs both dashboard and MCP server simultaneously
- Ideal for development and power users

## 🛠️ MCP Tools Available

The SpecGen server provides 8 comprehensive MCP tools:

### **Specification Management**
- `create_spec` - Create new specifications with markdown content
- `update_spec` - Update existing specifications (title, content, status)
- `get_spec` - Retrieve specifications by ID with full details
- `list_specs` - List specifications with pagination and filtering
- `delete_spec` - Remove specifications

### **Search & Discovery**
- `search_specs` - Full-text search with relevance scoring
- `get_spec_stats` - Comprehensive statistics and analytics

### **Dashboard Control**
- `launch_dashboard` - Launch interactive dashboard with custom settings

## 📊 API Endpoints

### **Core API**
- `GET /api` - API documentation and endpoint information
- `GET /health` - Server health status and system information

### **Specifications**
- `GET /api/specs` - List specifications (pagination, filtering, sorting)
- `POST /api/specs` - Create new specification
- `GET /api/specs/:id` - Get specification by ID
- `PUT /api/specs/:id` - Update specification
- `DELETE /api/specs/:id` - Delete specification

### **Search**
- `GET /api/search?q=term` - Full-text search with BM25 ranking
- Supports pagination, minimum score filtering, and snippet highlighting

### **Dashboard**
- `GET /dashboard/api/stats` - Live dashboard statistics
- `GET /dashboard/*` - React frontend (SPA routing)
- `WebSocket /ws` - Real-time updates and collaboration

## 🔧 Configuration

### Environment Variables
```bash
# Database
DATABASE_PATH=./specgen.sqlite
DATABASE_WAL_MODE=true

# Server Settings
PORT=3000
API_PREFIX=/api
ENABLE_CORS=true

# Dashboard Settings  
DASHBOARD_PORT=3001
DASHBOARD_AUTO_OPEN=true

# WebSocket Settings
WEBSOCKET_ENABLED=true
WEBSOCKET_PING_INTERVAL=30000
WEBSOCKET_MAX_CONNECTIONS=100
WEBSOCKET_HEARTBEAT_TIMEOUT=60000

# Logging
LOG_LEVEL=info
```

### Claude Code MCP Configuration
Add to your Claude Code MCP settings:
```json
{
  "name": "specgen-mcp",
  "command": "node",
  "args": ["/Users/pawanraviee/Documents/GitHub/agentic-workflows/specgen/build/index.js", "--mode", "mcp"],
  "scope": "local"
}
```

## 🧪 Testing & Validation

### Run Comprehensive Tests
```bash
# Functional validation
node test-functional.js

# Dashboard integration tests  
node test-dashboard.js

# Unit tests (Jest)
npm test
```

### Expected Test Results
- ✅ Database initialization and migrations
- ✅ Service layer CRUD operations
- ✅ Full-text search functionality
- ✅ WebSocket real-time updates
- ✅ API endpoint responses
- ✅ MCP tool availability and validation
- ✅ Configuration system loading

## 🛡️ Security Features

### **Production-Ready Security**
- **Helmet.js**: Security headers and XSS protection
- **CORS Configuration**: Restricted origins for API access
- **Input Validation**: Zod schemas for all API inputs
- **Connection Limits**: WebSocket connection throttling
- **SQL Injection Protection**: TypeORM query parameterization

### **Local Development Focus**
- Server binds to `localhost` only (no external access)
- Database stored locally with file permissions
- No authentication required for local development

## 🚀 Development Workflow

### 1. **Initial Setup**
```bash
cd /Users/pawanraviee/Documents/GitHub/agentic-workflows/specgen
npm install
npm run build
```

### 2. **Frontend Development**
```bash
cd dashboard
npm install
npm run dev  # Development server with hot reload
npm run build  # Production build
```

### 3. **Backend Development**
```bash
npm run dev  # TypeScript watch mode
npm run build  # Compile TypeScript
npm start  # Run production build
```

### 4. **Database Management**
```bash
# Database is automatically initialized
# Migrations run on startup
# No manual database setup required
```

## 📁 Project Structure

```
specgen/
├── src/                          # Core server implementation
│   ├── integrated-server.ts     # Main server orchestrator
│   └── dashboard/               # WebSocket and dashboard logic
├── api/                         # Express.js API routes
│   ├── server.ts               # API server configuration
│   ├── routes/                 # REST API endpoints
│   └── controllers/            # Business logic handlers
├── mcp/                        # Model Context Protocol
│   ├── tools/                  # MCP tool implementations
│   └── resources/              # MCP resource providers
├── services/                   # Business logic services
├── database/                   # Database configuration and entities
├── config/                     # Environment and settings
├── dashboard/                  # React frontend application
│   ├── src/                   # React components and logic
│   └── build/                 # Compiled frontend assets
├── tests/                      # Test suites
└── build/                      # Compiled TypeScript output
```

## 🔍 Troubleshooting

### **Dashboard Won't Load**
1. Ensure frontend is built: `cd dashboard && npm run build`
2. Check server logs for static file serving errors
3. Verify port availability: `lsof -i :3001`

### **WebSocket Connection Failed**
1. Check browser console for connection errors
2. Verify WebSocket is enabled in configuration
3. Confirm port accessibility and firewall settings

### **Search Not Working**
1. Database may need time to build search index
2. Check FTS5 is available in SQLite installation
3. Review search service logs for indexing errors

### **MCP Tools Not Available**
1. Restart Claude Code after server changes
2. Verify MCP configuration with: `claude mcp list`
3. Check server stdio transport is working correctly

## 🎉 What's New in This Version

### **Major Features**
- 🌐 **Complete Interactive Dashboard**: Rich web interface with real-time collaboration
- 📝 **Advanced Markdown Editor**: Monaco Editor with live preview and auto-save
- 🔍 **Full-Text Search**: FTS5 with BM25 ranking and snippet highlighting
- 🔄 **Real-time Updates**: WebSocket integration for live collaboration
- 📊 **Analytics Dashboard**: Live statistics and activity tracking

### **Technical Improvements**
- ⚡ **Dual Server Architecture**: Simultaneous MCP and HTTP server support
- 🔧 **Configuration Management**: Environment-based settings system
- 🛡️ **Enhanced Security**: Comprehensive input validation and security headers
- 🧪 **Comprehensive Testing**: Functional, integration, and end-to-end tests
- 📱 **Responsive Design**: Mobile-first UI with Tailwind CSS

## 📞 Next Steps

1. **Launch the Dashboard**: Use `launch_dashboard` MCP tool or command line
2. **Explore the Interface**: Create, edit, and search specifications
3. **Test Real-time Features**: Open multiple browser tabs to see live updates
4. **Integrate with Claude**: Use MCP tools for specification management
5. **Customize Settings**: Adjust ports, features, and behavior via environment variables

**🚀 Your interactive SpecGen dashboard is ready for production use!**