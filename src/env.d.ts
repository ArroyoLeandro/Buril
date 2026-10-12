/// <reference types="astro/client" />

// `tsc` cannot resolve .astro files on its own (`astro check` can). This declaration lets tests
// import pages for the container API under a plain `tsc --noEmit`.
declare module "*.astro" {
  const component: import("astro/runtime/server/index.js").AstroComponentFactory;
  export default component;
}
