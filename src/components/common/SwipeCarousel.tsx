import {useEffect, useState, type CSSProperties, type ReactNode} from "react";
import {Swiper, SwiperSlide} from "swiper/react";
import {A11y, Mousewheel} from "swiper/modules";
import type {Swiper as SwiperInstance} from "swiper";
import type {SwiperOptions} from "swiper/types";
import {ChevronLeft, ChevronRight} from "lucide-react";
import {prefersReducedMotion} from "@/lib/motion";
import {cn} from "@/lib/utils";

// The one carousel the site uses, built on Swiper so it behaves the same
// everywhere: swipe on a phone, drag with a mouse, side-scroll on a
// trackpad, arrow keys once it has focus. Swiper's stylesheet is imported
// into the base layer in global.css, so Tailwind classes here win over it.

export interface SwipeCarouselItem {
    key: string;
    content: ReactNode;
}

export interface SwipeCarouselProps {
    items: SwipeCarouselItem[];
    // What the carousel holds, read out by screen readers ("Client results").
    label: string;
    // "center" keeps the current slide in the middle (the photo strip).
    // "start" lines the first card up with the page edge and the last with
    // the far edge, centring the ones between (the reviews).
    align?: "center" | "start";
    // Previous / next buttons under the carousel, with these spoken names.
    controls?: {previous: string; next: string};
    // Swiper settings that change with screen width, keyed by min width in px.
    breakpoints?: SwiperOptions["breakpoints"];
    controlsClassName?: string;
    slideClassName?: string;
    className?: string;
    style?: CSSProperties;
}

// Swiper won't start a swipe on anything in this list. Its default includes
// `button`, which would stop the photo strip (every photo is a button that
// opens the viewer) from being swiped at all.
const NO_SWIPE_ON = "input, select, option, textarea, video, label";

const stepButton =
    "grid size-11 place-items-center rounded-full border border-border-strong text-foreground transition-colors hover:border-achieve-blue hover:bg-achieve-soft disabled:opacity-30";

export function SwipeCarousel({items, label, align = "center", controls, breakpoints, controlsClassName, slideClassName, className, style}: SwipeCarouselProps) {
    const [swiper, setSwiper] = useState<SwiperInstance | null>(null);
    const [edges, setEdges] = useState({atStart: true, atEnd: items.length <= 1});

    const syncEdges = (instance: SwiperInstance) =>
        setEdges({atStart: instance.isBeginning, atEnd: instance.isEnd});

    // Arrow keys move this carousel only while it has focus, so two carousels
    // on screen don't both move (Swiper's Keyboard module listens page-wide).
    // Attached by hand: Swiper's React wrapper treats every `on...` prop as a
    // Swiper event, so an onKeyDown prop would never reach the element.
    useEffect(() => {
        if (!swiper) return;
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "ArrowRight") swiper.slideNext();
            else if (event.key === "ArrowLeft") swiper.slidePrev();
            else return;
            event.preventDefault();
        };
        swiper.el.addEventListener("keydown", onKeyDown);
        return () => swiper.el.removeEventListener("keydown", onKeyDown);
    }, [swiper]);

    return (
        <div>
            <Swiper
                modules={[A11y, Mousewheel]}
                tabIndex={0}
                slidesPerView="auto"
                spaceBetween={12}
                centeredSlides
                centeredSlidesBounds={align === "start"}
                breakpoints={breakpoints}
                speed={prefersReducedMotion() ? 0 : 400}
                grabCursor
                noSwipingSelector={NO_SWIPE_ON}
                // Trackpads scroll sideways with the wheel event. Vertical
                // wheel movement is left alone so the page still scrolls.
                mousewheel={{forceToAxis: true, releaseOnEdges: true}}
                a11y={{
                    containerMessage: label,
                    containerRoleDescriptionMessage: "carousel",
                    itemRoleDescriptionMessage: "slide",
                    slideLabelMessage: "{{index}} of {{slidesLength}}",
                }}
                onSwiper={(instance) => {
                    setSwiper(instance);
                    syncEdges(instance);
                }}
                onSlideChange={syncEdges}
                onResize={syncEdges}
                // The carousel bleeds into the page gutters like it does on a
                // phone. Swiper measures slides inside its padding, so the
                // gutter padding keeps the centring right while the slides
                // stay visible as they pass through it.
                className={cn("swipe-carousel -mx-gutter px-gutter pb-2", className)}
                style={style}
            >
                {items.map((item) => (
                    <SwiperSlide key={item.key} className={slideClassName}>
                        {item.content}
                    </SwiperSlide>
                ))}
            </Swiper>

            {controls && (
                <div className={cn("mt-4 flex items-center justify-between gap-4", controlsClassName)}>
                    <button
                        type="button"
                        onClick={() => swiper?.slidePrev()}
                        disabled={edges.atStart}
                        aria-label={controls.previous}
                        className={stepButton}
                    >
                        <ChevronLeft aria-hidden="true" className="size-5"/>
                    </button>
                    <button
                        type="button"
                        onClick={() => swiper?.slideNext()}
                        disabled={edges.atEnd}
                        aria-label={controls.next}
                        className={stepButton}
                    >
                        <ChevronRight aria-hidden="true" className="size-5"/>
                    </button>
                </div>
            )}
        </div>
    );
}
