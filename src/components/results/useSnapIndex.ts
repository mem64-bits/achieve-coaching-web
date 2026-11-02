import {useEffect, useState, type RefObject} from "react";

export function useSnapIndex(trackRef: RefObject<HTMLElement | null>, itemCount: number): number {
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        const track = trackRef.current;
        if (!track || itemCount === 0) {
            return;
        }

        const items = Array.from(track.children);
        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        setActiveIndex(items.indexOf(entry.target));
                    }
                }
            },
            {root: track, rootMargin: "0px -49%"},
        );

        items.forEach((item) => observer.observe(item));
        return () => observer.disconnect();
    }, [trackRef, itemCount]);

    return activeIndex;
}

export function scrollItemIntoCenter(track: HTMLElement | null, index: number, behavior: ScrollBehavior = "smooth") {
    const item = track?.children.item(index) as HTMLElement | null;
    if (!track || !item) {
        return;
    }

    const left = item.offsetLeft - (track.clientWidth - item.offsetWidth) / 2;
    track.scrollTo({left, behavior});
}

export function prefersReducedMotion(): boolean {
    return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
