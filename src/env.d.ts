/// <reference types="astro/client" />

declare module "*.svg" {
    const content: any;
    export default content;
}