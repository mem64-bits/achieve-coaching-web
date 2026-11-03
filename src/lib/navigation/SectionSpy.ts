// Lights up the header link for whichever section is on screen.
//
// Chrome and Edge can do the tracking natively with `scroll-target-group`
// and `:target-current`, so there we only mirror the result into
// aria-current for screen readers. Other browsers get an observer that
// watches a thin line across the middle of the viewport and adds the same
// `target-current` class the CSS listens for.

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
            this.#observeSections();
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

    #observeSections() {
        // Header links point at sections in page order, but the nav lists them
        // in its own order, so sort by where each section sits in the document.
        const ids = [...new Set(this.#links.map(hashOf))];
        const sections = ids
            .map((id) => document.getElementById(id))
            .filter((section): section is HTMLElement => section !== null)
            .sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
        if (sections.length === 0) return;

        const crossingMiddle = new Set<string>();
        const lastSection = sections[sections.length - 1];

        const pick = () => {
            // The footer is short, so it may never reach the middle line.
            // Once the page can't scroll any further, treat it as current.
            const atBottom = innerHeight + scrollY >= document.documentElement.scrollHeight - 4;
            if (atBottom) return this.#setActive(lastSection.id, true);

            const visible = sections.filter((section) => crossingMiddle.has(section.id));
            this.#setActive(visible.at(-1)?.id ?? null, true);
        };

        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) crossingMiddle.add(entry.target.id);
                    else crossingMiddle.delete(entry.target.id);
                }
                pick();
            },
            {rootMargin: "-50% 0px -50% 0px", threshold: 0},
        );
        sections.forEach((section) => observer.observe(section));

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
