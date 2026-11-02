/** Site-wide links. */
export const githubUrl = "https://github.com/ArroyoLeandro/Buril";
export const licenseUrl = `${githubUrl}/blob/main/LICENSE`;

/** The hosted docs site. It also serves the registry: one JSON file per item under `/r/`. */
export const siteUrl = "https://buril.site";

/** The URL pattern the shadcn CLI and MCP server resolve `@buril/<name>` with. */
export const registryUrl = `${siteUrl}/r/{name}.json`;

/** The registry JSON of one item, such as `button`. */
export const registryItemUrl = (name: string) => `${siteUrl}/r/${name}.json`;
