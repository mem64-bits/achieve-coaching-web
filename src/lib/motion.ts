// True when the visitor has asked their device for less motion. Safe to call
// while rendering on the server, where it answers false.
export function prefersReducedMotion(): boolean {
    return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
