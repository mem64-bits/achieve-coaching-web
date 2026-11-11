// Keeps "#section" links landing on the start of their section.
//
// Sections marked `.defer-render` skip rendering until they're near the
// screen, and hold their place with an estimated height. A jump works out
// its destination from those estimates, so if the sections in between are
// shorter than guessed, the page shifts up as they render and you land
// partway into the section you asked for.
//
// Just before the jump we let every deferred section render, so the
// destination is measured from real heights. Once the scroll settles we
// hand them back to the browser. `contain-intrinsic-size: auto` makes each
// one remember the size it just had, so nothing moves when they go back
// to being skipped.

const RENDER_ALL_CLASS = "render-deferred";
// Safety net for browsers without `scrollend`, or a jump that doesn't
// actually move the page (already at the target).
const RELEASE_AFTER_MS = 2000;

export class InPageJumps {
    #releaseTimer: number | undefined;

    start() {
        // Capture phase, so this runs before the browser follows the link.
        document.addEventListener("click", (event) => this.#onClick(event), {capture: true});
    }

    #onClick(event: MouseEvent) {
        if (event.defaultPrevented || event.button !== 0) return;
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

        const link = (event.target as Element | null)?.closest<HTMLAnchorElement>("a[href^='#']");
        if (!link || link.hash.length < 2) return;
        if (!document.getElementById(decodeURIComponent(link.hash.slice(1)))) return;

        this.#renderEverything();
    }

    #renderEverything() {
        document.documentElement.classList.add(RENDER_ALL_CLASS);

        // A second click mid-scroll just restarts the wait.
        clearTimeout(this.#releaseTimer);
        addEventListener("scrollend", this.#release, {once: true});
        this.#releaseTimer = window.setTimeout(this.#release, RELEASE_AFTER_MS);
    }

    // An arrow function, so it's the same listener every time and can be removed.
    #release = () => {
        clearTimeout(this.#releaseTimer);
        removeEventListener("scrollend", this.#release);
        document.documentElement.classList.remove(RENDER_ALL_CLASS);
    };
}
