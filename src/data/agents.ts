import type { Text } from "./accessibility";
import { registryUrl } from "./site";

/**
 * How AI agents reach Buril through the shadcn MCP server, shared by the AI agents page and
 * `/llms.txt`. The server reads every registry listed in the project's `components.json`, so
 * Buril needs no server of its own. Clients, config files and the steps after `mcp init` as
 * documented at https://ui.shadcn.com/docs/mcp.
 */
export interface McpClient {
  /** The value of `shadcn mcp init --client`. */
  id: string;
  name: string;
  /** The file `mcp init` writes, or that you edit yourself when `manual` is set. */
  config: string;
  /** The CLI cannot write this client's config, so you add the entry by hand. */
  manual?: boolean;
  /** What to do after `mcp init`; `backticks` mark inline code. */
  next: Text;
}

export const mcpClients: readonly McpClient[] = [
  {
    id: "claude",
    name: "Claude Code",
    config: ".mcp.json",
    next: {
      en: "Check the connection with `/mcp` in Claude Code.",
      es: "Comprueba la conexión con `/mcp` en Claude Code.",
    },
  },
  {
    id: "cursor",
    name: "Cursor",
    config: ".cursor/mcp.json",
    next: {
      en: "Turn on the shadcn server in Cursor Settings.",
      es: "Activa el servidor shadcn en la configuración de Cursor.",
    },
  },
  {
    id: "vscode",
    name: "VS Code",
    config: ".vscode/mcp.json",
    next: {
      en: "Open `.vscode/mcp.json` and click Start next to the shadcn server.",
      es: "Abre `.vscode/mcp.json` y haz clic en Start junto al servidor shadcn.",
    },
  },
  {
    id: "opencode",
    name: "OpenCode",
    config: "opencode.json",
    next: { en: "Restart OpenCode.", es: "Reinicia OpenCode." },
  },
  {
    id: "codex",
    name: "Codex",
    config: "~/.codex/config.toml",
    manual: true,
    next: {
      en: "The CLI cannot edit this file: add the entry below by hand, then restart Codex.",
      es: "La CLI no puede editar este archivo: agrega a mano la entrada de abajo y reinicia Codex.",
    },
  },
];

/** The shadcn CLI arguments that set up the MCP server for one client. */
export const mcpInitCommand = (client: string) => `mcp init --client ${client}`;

/** The `registries` entry for `components.json` that names Buril `@buril`. */
export const registriesExample = JSON.stringify({ registries: { "@buril": registryUrl } }, null, 2);

/** The entry Codex needs in `~/.codex/config.toml`, which the CLI cannot write. */
export const codexConfigExample = `[mcp_servers.shadcn]
command = "npx"
args = ["shadcn@latest", "mcp"]`;

/** Requests to try once the server runs. */
export const agentPrompts: Text[] = [
  {
    en: "Show me the components in the @buril registry.",
    es: "Muéstrame los componentes del registry @buril.",
  },
  {
    en: "Add @buril/button and @buril/field to my project.",
    es: "Agrega @buril/button y @buril/field a mi proyecto.",
  },
  {
    en: "Build a signup form with the Buril Field, Input and Button.",
    es: "Crea un formulario de registro con Field, Input y Button de Buril.",
  },
];
