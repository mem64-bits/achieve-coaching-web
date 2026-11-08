// Lights up the header link for whichever section is on screen.
//
// Chrome and Edge can do the tracking natively with `scroll-target-group`
// and `:target-current`, so there we only mirror the result into
// aria-current for screen readers. Other browsers get a scroll listener
// that picks the last target whose top has passed the middle of the screen
// and adds the same `target-current` class the CSS listens for.

export const ACTIVE_LINK_CLASS = "target-current";
const NAV_SELECTOR = "[data-section-nav] a[href^='#']";

const hashOf = (link: HTMLAnchorElement) => link.getAttribute("href")!.slice(1);

export class SectionSpy {
    readonly #links: HTMLAnchorElement[];
    #activeId: string | null = null;

    constructor(root: ParentNode = document) {
        this.#links = [...root.querySelectorAll<HTMLAnchorElement>(NAV_SELECTOR)];
    }

    start() {
        if (this.#links.length === 0) return;

        if (CSS.supports("scroll-target-group: auto")) {
            this.#followNativeMarkers();
        } else {
            this.#followScrollPosition();
        }
    }

    #followNativeMarkers() {
        const sync = () => {
            const current = this.#links.find((link) => link.matches(":target-current"));
            this.#setActive(current ? hashOf(current) : null, false);
        };

        // `:target-current` settles on the frame after scrolling stops, so
        // read it one frame later or a quick jump can leave the old answer.
        const syncNextFrame = () => requestAnimationFrame(sync);
        syncNextFrame();
        addEventListener("scrollend", syncNextFrame, {passive: true});
    }

    #followScrollPosition() {
        // Header links point at targets in page order, but the nav lists them
        // in its own order, so sort by where each target sits in the document.
        const ids = [...new Set(this.#links.map(hashOf))];
        const targets = ids
            .map((id) => document.getElementById(id))
            .filter((target): target is HTMLElement => target !== null)
            .sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));

        if (targets.length === 0) return;
        const lastTarget = targets[targets.length - 1];

        // The current target is the last one whose top has scrolled above the
        // middle of the screen. A target can be a whole section or just a
        // heading (Reviews is the heading inside the results section), so we
        // go by where each one starts rather than whether it covers the middle.
        const pick = () => {
            // The footer is short, so its top may never reach the middle.
            // Once the page can't scroll any further, treat it as current.
            const atBottom = innerHeight + scrollY >= document.documentElement.scrollHeight - 4;
            if (atBottom) return this.#setActive(lastTarget.id, true);

            const middle = innerHeight / 2;
            const passed = targets.filter((target) => target.getBoundingClientRect().top <= middle);
            this.#setActive(passed.at(-1)?.id ?? null, true);
        };

        pick();
        let queued = false;
        addEventListener(
            "scroll",
            () => {
                if (queued) return;
                queued = true;
                requestAnimationFrame(() => {
                    queued = false;
                    pick();
                });
            },
            {passive: true},
        );
        addEventListener("resize", pick, {passive: true});
    }

    #setActive(id: string | null, toggleClass: boolean) {
        if (id === this.#activeId) return;
        this.#activeId = id;

        for (const link of this.#links) {
            const isActive = hashOf(link) === id;
            if (toggleClass) link.classList.toggle(ACTIVE_LINK_CLASS, isActive);
            if (isActive) link.setAttribute("aria-current", "true");
            else link.removeAttribute("aria-current");
        }
    }
}
