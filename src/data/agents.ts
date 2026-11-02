import { registryUrl } from "./site";

/**
 * How AI agents reach Buril through the shadcn MCP server, shared by the AI agents page and
 * `/llms.txt`. The server reads every registry listed in the project's `components.json`, so
 * Buril needs no server of its own. Clients and config files as documented at
 * https://ui.shadcn.com/docs/mcp.
 */
export interface McpClient {
  /** The value of `shadcn mcp init --client`. */
  id: string;
  name: string;
  /** The file `mcp init` writes, or that you edit yourself when `manual` is set. */
  config: string;
  /** The CLI cannot write this client's config, so you add the entry by hand. */
  manual?: boolean;
}

export const mcpClients: readonly McpClient[] = [
  { id: "claude", name: "Claude Code", config: ".mcp.json" },
  { id: "cursor", name: "Cursor", config: ".cursor/mcp.json" },
  { id: "vscode", name: "VS Code", config: ".vscode/mcp.json" },
  { id: "opencode", name: "OpenCode", config: "opencode.json" },
  { id: "codex", name: "Codex", config: "~/.codex/config.toml", manual: true },
];

/** The shadcn CLI arguments that set up the MCP server for one client. */
export const mcpInitCommand = (client: string) => `mcp init --client ${client}`;

/** The `registries` entry for `components.json` that names Buril `@buril`. */
export const registriesExample = JSON.stringify({ registries: { "@buril": registryUrl } }, null, 2);

/** The entry Codex needs in `~/.codex/config.toml`, which the CLI cannot write. */
export const codexConfigExample = `[mcp_servers.shadcn]
command = "npx"
args = ["shadcn@latest", "mcp"]`;

/** Requests to try once the server runs. They stay in English: they are typed into the agent. */
export const agentPrompts = [
  "Show me the components in the @buril registry.",
  "Add @buril/button and @buril/field to my project.",
  "Build a signup form with the Buril Field, Input and Button.",
];
