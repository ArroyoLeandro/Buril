import type { APIRoute } from "astro";

import { llmsTxt } from "../data/llms";

/** `/llms.txt`, written at build time: the llmstxt.org index of the docs and the registry. */
export const GET: APIRoute = () =>
  new Response(llmsTxt(), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
