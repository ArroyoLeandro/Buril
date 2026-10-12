// jsdom ships no types and @types/jsdom is not installed; the docs axe test needs only this.
declare module "jsdom" {
  export class JSDOM {
    constructor(html?: string);
    readonly window: Window & typeof globalThis;
  }
}
