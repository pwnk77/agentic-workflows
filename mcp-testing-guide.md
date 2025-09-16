# MCP Quick Guide — 16-Sep-2025

## A) MCP Overview, Protocols, Latest Updates

**What is MCP?**
The **Model Context Protocol (MCP)** is an open standard for connecting LLMs to external tools, services, and data in a consistent and secure way. It defines how servers (tools/resources) expose capabilities and how clients (like Claude Code, MCP Inspector) consume them.

**Core Concepts:**

* **Servers:** Provide tools (functions/actions) and resources (structured data) to LLMs.
* **Clients:** Orchestrate servers, provide a UI, and manage context.
* **Messages:** JSON-RPC 2.0–like protocol for requests and responses.
* **Authentication:** API keys, OAuth, or other methods — servers declare requirements.
* **Versioning:** Current stable revision (as of Sep 2025) is **2025-06-18**.

**Latest Updates (2025):**

* Extended **resource streaming** for large dataset delivery.
* Support for **incremental tool schemas** to improve discoverability.
* Stronger **auth metadata declarations** (OAuth, token-based, signed requests).
* More mature **error codes and structured responses**.

---

## B) Tools, Prompts, and Resources

### Tools

Tools are functions exposed by MCP servers. You use them when the model needs to *take action* beyond reasoning. Example use cases:

* **Search tools:** Query APIs or knowledge bases.
* **DevOps tools:** Trigger CI/CD, manage infrastructure.
* **Data tools:** Run SQL, query APIs, fetch structured info.
* **Custom business tools:** E.g., fetch compliance rules, risk data.

**When to use:**

* If a task requires *external action* or *fresh data* not in model memory.
* For repeatable workflows (e.g., generating PRs, linting code).
* When safety requires clear API contracts.

### Prompts

Prompts wrap instructions to tools and resources. They can:

* Standardize usage (“always check auth before running X”).
* Provide guardrails (templates for tool execution).
* Simplify repetitive workflows (e.g., `/deploy staging`).

**When to use:**

* For predictable task patterns (dev workflows, structured queries).
* When sharing best practices with teams.
* To enforce governance (security review prompts, compliance prompts).

### Resources

Resources are data streams exposed to the model:

* **Static:** Config files, schemas, documents.
* **Dynamic:** Live metrics, logs, API responses.
* **Large:** Databases, spreadsheets (via pagination/streaming).

**When to use:**

* When LLM reasoning requires structured inputs.
* For grounding answers in **authoritative data**.
* When context length is not enough (resources stream partials).

---

## C) MCP Tool Add / Remove Guide in Claude Code

**Add a tool/server:**

```bash
claude mcp add <name> --url <server_url> --key <api_key>
```

* `name` = identifier in Claude Code.
* `--url` = endpoint implementing MCP.
* `--key` = auth if required.

**Remove a tool/server:**

```bash
claude mcp remove <name>
```

**List current servers:**

```bash
claude mcp list
```

**Best Practices:**

* Keep non-prod/test tools separate (prefix with `test-`).
* Rotate API keys regularly.
* Use `list` often to ensure stale servers are not left connected.

Here’s an updated, detailed doc with **examples** of adding/removing MCP servers in Claude Code, especially with **Node / Python servers**, using **user vs project scope**, using the `add-json` form, and pulling from the latest official docs.

---

# Managing MCP Servers in Claude Code — Expanded Guide (with Node/Python + Scopes)

## What’s New / Refresher

Based on the latest Claude Code docs (as of September 2025):

* Scopes available: `local` (default), `user`, `project`. ([Anthropic][1])
* You can add a server via CLI (`add`, `add-json`, etc.) or by editing JSON config files directly (for more custom setups). ([Anthropic][1])
* Environment variable expansion is supported in JSON configs. ([Anthropic][1])
* For remote servers, transports like `http`, `sse` are supported, and you can include custom headers. ([Anthropic][1])

---

## Commands / Examples

These show how to add Node / Python servers, with different scopes, as well as how to remove and inspect them.

---

### Example A: Node.js MCP Server, user scope

Suppose you have a Node.js-based MCP server package called `@modelcontextprotocol/server-github` and you want it available globally for your user.

```bash
claude mcp add github --scope user --transport stdio -- \
  npx -y @modelcontextprotocol/server-github
```

Explanation:

* `--scope user`: server is added to user config, available across your projects.
* `--transport stdio`: using stdio transport (local process).
* The `--` splits CLI flags from the command you're launching (the process). Here `npx -y @modelcontextprotocol/server-github` starts it.

---

### Example B: Python MCP Server, project scope

Suppose you have a Python script `weather_mcp.py` you wrote, implementing MCP tools, located in your project repo. You want this only for this project, shared with your team via version control.

```bash
cd ~/projects/my-app
claude mcp add weather --scope project --transport stdio -- \
  python3 ./weather_mcp.py
```

* `--scope project`: config will go to `.mcp.json` in your project root. ([Anthropic][1])
* Use `python3 ./weather_mcp.py` to launch that server.

---

### Example C: Using `add-json` to register a server with custom config (Node or Python)

This helps when you need more fields (env vars, arguments, cwd, etc.):

```bash
claude mcp add-json node-fetcher --scope user '{
  "command": "node",
  "args": [
    "/path/to/node-fetcher/index.js",
    "--port",
    "4000"
  ],
  "env": {
    "API_KEY": "${NODE_FETCHER_KEY}"
  }
}'
```

Or a Python server:

```bash
claude mcp add-json py-processor --scope project '{
  "command": "python3",
  "args": [
    "processor_server.py",
    "--mode",
    "batch"
  ],
  "cwd": "./tools/py-processor",
  "env": {
    "PROCESSOR_CONFIG": "${PROC_CONF:-default}"
  }
}'
```

---

### Example D: Remote HTTP or SSE server

If you have a remote MCP server (hosted), you can connect via HTTP or SSE with authentication headers.

```bash
claude mcp add sentiment-api --scope user --transport http \
  https://mcp.sentiment.example.com/mcp \
  --header "Authorization: Bearer ${SENTIMENT_API_TOKEN}"
```

Or SSE:

```bash
claude mcp add live-updates --scope user --transport sse \
  https://mcp.updates.example.com/sse \
  --header "X-API-KEY: ${UPDATES_KEY}"
```

---

## Removing / Listing / Inspecting Servers

* **List all servers:**

  ```bash
  claude mcp list
  ```

* **Get details of a specific server:**

  ```bash
  claude mcp get weather
  ```

* **Remove a server:**

  ```bash
  claude mcp remove weather
  ```

If a server was added with a specific scope, you can indicate that when removing too:

```bash
claude mcp remove weather --scope project
```

---

## Scope Definitions & Behavior

| Scope     | Location of Config File                         | Visibility                                  | Good for…                               |
| --------- | ----------------------------------------------- | ------------------------------------------- | --------------------------------------- |
| `local`   | Usually stored temporarily / in session context | Only in current workspace/session           | Quick testing, throwaway servers        |
| `project` | `.mcp.json` in project root                     | Shared among people working on that project | Tools specific to that project          |
| `user`    | User home config (`~/.claude.json` or similar)  | Available across all projects for that user | Frequently used tools, personal utility |

* If there are conflicting definitions (same server name in different scopes), Claude Code uses scope precedence: **project** overrides **user/local** (project > user > local) in context of that project. ([Anthropic][1])
* Project scope servers are supposed to appear in listings, but there is a known bug that they sometimes don’t show up in `claude mcp list` on some platforms. ([GitHub][2])

---

## Practical Examples Putting It All Together

Here are two realistic scenarios:

### Scenario 1: Developer setting up shared MCP servers for a team project

You are working on a web app with your team. You need a GitHub MCP server (for PR reviews) and a custom data-processing Python server for analytics, but only for this project.

1. In project root:

   ```bash
   claude mcp add github --scope project --transport stdio -- \
     npx -y @modelcontextprotocol/server-github
   ```

2. Add your custom Python server:

   ```bash
   claude mcp add-json data-processor --scope project '{
     "command": "python3",
     "args": ["./tools/data_processor/server.py"],
     "cwd": "./tools/data_processor",
     "env": {
       "DP_CONFIG": "${DP_CONFIG}"
     }
   }'
   ```

3. Commit `.mcp.json` to version control so all team members get the same MCP servers.

---

### Scenario 2: Personal / frequent tools, user-scope

You use a date/time server, a fetcher, and filesystem-access server across many projects. You want them globally available.

```bash
claude mcp add time-server --scope user --transport stdio -- \
  uvx mcp-server-time --local-timezone "Asia/Kolkata"
  
claude mcp add-json fetcher --scope user '{
  "command": "uvx",
  "args": ["mcp-server-fetch"],
  "env": {}
}'

claude mcp add filesystem --scope user --transport stdio -- \
  npx -y @modelcontextprotocol/server-filesystem /home/you/Documents /home/you/Projects
```

---

## Notes / Caveats From Latest Docs & Issues

* Even if project-scoped servers work, sometimes `claude mcp list` may **not show** project-scoped servers due to a known UI/CLI listing bug. But `claude mcp get <name>` still works. ([GitHub][2])
* Always verify after adding a server (via `claude mcp get`) to ensure args, env, transport are correct.
* Use environment variable expansion for secrets rather than hardcoding. ([Anthropic][1])

---

# MCP Server Testing Deep Dive — 16-Sep-2025

## 1. Testing at the Tool Level

**Objective:** Verify that each tool exposed by the MCP server behaves correctly, adheres to its schema, and returns consistent results.

### Steps

1. **Discovery**

   ```bash
   inspector list-tools --url http://localhost:3000
   ```

   Confirms that all expected tools are discoverable.

2. **Schema Validation**

   ```bash
   inspector validate-tool --url http://localhost:3000 --tool <toolName>
   ```

   Ensures input/output match declared JSON schema.

3. **Functional Testing**

   ```bash
   inspector run-tool --url http://localhost:3000 --tool <toolName> --input '{"arg": "value"}'
   ```

   Validates actual execution. Capture output for regression.

4. **Edge Cases**

   * Invalid inputs.
   * Missing required fields.
   * Large payloads.

### Sample Input/Output

**Input:**

```json
{
  "query": "SELECT * FROM users WHERE active = true"
}
```

**Expected Output:**

```json
{
  "status": "ok",
  "rows": [
    {"id": 1, "name": "Alice", "active": true},
    {"id": 2, "name": "Bob", "active": true}
  ]
}
```

---

## 2. Testing at the Prompt Level

**Objective:** Ensure prompts interacting with tools are consistent, contextual, and secure.

### Steps

1. **Prompt Template Validation**

   * Verify placeholders are resolved correctly.
   * Ensure system prompts provide enough context.

2. **Round-trip Testing**

   ```bash
   inspector run-tool --url http://localhost:3000 --tool <toolName> --input @prompt.json
   ```

   where `prompt.json` is generated from the template.

3. **Security Review**

   * Test for prompt injection vulnerabilities.
   * Verify prompts enforce constraints (e.g., safe SQL execution).

### Sample Prompt

**Template:**

```json
{
  "prompt": "Fetch user details for user: {{username}}"
}
```

**Rendered Input (with username=carol):**

```json
{
  "prompt": "Fetch user details for user: carol"
}
```

**Expected Output:**

```json
{
  "status": "ok",
  "data": {"id": 3, "name": "Carol", "active": false}
}
```

---

## 3. Testing at the Resource Level

**Objective:** Validate resources (static, dynamic, streaming) are exposed correctly and usable by LLMs.

### Steps

1. **Discovery**

   ```bash
   inspector list-resources --url http://localhost:3000
   ```

2. **Schema Validation**

   ```bash
   inspector validate-resource --url http://localhost:3000 --resource <resourceName>
   ```

3. **Data Integrity**

   * Fetch and validate sample resource payloads.
   * Test pagination for large resources.
   * Simulate streaming scenarios.

4. **Error Handling**

   * Request non-existent resource.
   * Expired/invalid auth.

### Sample Resource Payload

**Request:**

```bash
curl http://localhost:3000/resources/config
```

**Response:**

```json
{
  "version": "1.0.0",
  "settings": {
    "retry": 3,
    "timeout": 5000
  }
}
```

**Streaming Example:**

```json
{"chunk": "data-part-1"}
{"chunk": "data-part-2"}
{"chunk": "data-part-3"}
```

---

## 4. Deep Dive: Protocol-Level Testing with MCP Inspector (CLI)

**Objective:** Validate compliance with MCP protocol specification (message formats, auth, error codes, versioning).

### Steps

1. **Handshake & Version Check**

   ```bash
   inspector protocol-check --url http://localhost:3000
   ```

   Confirms server declares correct protocol revision.

2. **Message Compliance**

   ```bash
   inspector protocol-validate --url http://localhost:3000 --log ./protocol.log
   ```

   Captures all request/response exchanges and validates against spec.

3. **Authentication Flows**

   * Test with valid API key.
   * Test with expired/invalid token.
   * Verify OAuth redirects if supported.

4. **Error Codes & Recovery**

   ```bash
   inspector error-test --url http://localhost:3000
   ```

   Ensures proper error codes are returned (not just generic 500s).

5. **Load & Stress Tests**

   ```bash
   inspector soak-test --url http://localhost:3000 --duration 5m --concurrency 20
   ```

   Checks protocol compliance under high concurrency.

### Sample Protocol Exchange

**Request:**

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "listTools"
}
```

**Response:**

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": [
    {
      "name": "searchUsers",
      "description": "Search users by filter",
      "schema": {"type": "object", "properties": {"query": {"type": "string"}}}
    }
  ]
}
```

---

## 5. Suggested Testing Workflow

1. **Local Development**

   * Validate tools/resources individually with sample fixtures.
   * Debug prompts with test payloads.

2. **Protocol Testing**

   * Run protocol validation and error tests.
   * Use sample JSON exchanges to confirm compliance.

3. **Staging/Pre-Production**

   * Perform soak and load testing.
   * Validate authentication and error flows.

---
