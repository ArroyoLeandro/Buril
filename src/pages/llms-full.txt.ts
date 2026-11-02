import type { APIRoute } from "astro";

import { llmsFullTxt } from "../data/llms";

/** `/llms-full.txt`, written at build time: the docs as one Markdown file. */
export const GET: APIRoute = () =>
  new Response(llmsFullTxt(), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
