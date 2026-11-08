import {useEffect, useState, type CSSProperties, type ReactNode} from "react";
import {Swiper, SwiperSlide} from "swiper/react";
import {A11y, EffectCoverflow, Mousewheel} from "swiper/modules";
import type {Swiper as SwiperInstance} from "swiper";
import {ChevronLeft, ChevronRight} from "lucide-react";
import {prefersReducedMotion} from "@/lib/motion";
import {cn} from "@/lib/utils";

// The one carousel the site uses, built on Swiper so it behaves the same
// everywhere: swipe on a phone, drag with a mouse, side-scroll on a
// trackpad, arrow keys once it has focus.
//
// Layout: phones and tablets show exactly one card, so the only way on is
// to swipe (or tap an arrow). From 1024px it shows three in a coverflow:
// the middle card faces you and the two either side sit further back,
// turned slightly (and dimmed, for photos), so it's obvious which one is
// in focus.
//
// Swiper's stylesheets are imported into the base layer in global.css, so
// Tailwind classes here win over them.

export interface SwipeCarouselItem {
    key: string;
    content: ReactNode;
}

export interface SwipeCarouselProps {
    items: SwipeCarouselItem[];
    // What the carousel holds, read out by screen readers ("Client results").
    label: string;
    // Wrap round from the last card to the first. Swiper needs a few more
    // cards than are on screen to do this, so short lists can't loop.
    loop?: boolean;
    // Dim the cards either side of the one in focus. Turn it off for cards
    // with text: at half strength their text fails contrast (reviews).
    dimSides?: boolean;
    // Previous / next buttons under the carousel, with these spoken names.
    controls?: {previous: string; next: string};
    controlsClassName?: string;
    slideClassName?: string;
    className?: string;
    style?: CSSProperties;
}

// Three cards in view from this width up (odd, so one is always in the
// middle). Below it there's only one, so tablets get a single card rather
// than three squeezed ones.
const WIDE_FROM = 1024;
const WIDE_CARDS = 3;

// Swiper won't start a swipe on anything in this list. Its default includes
// `button`, which would stop the photo strip (every photo is a button that
// opens the viewer) from being swiped at all.
const NO_SWIPE_ON = "input, select, option, textarea, video, label";

const stepButton =
    "grid size-11 place-items-center rounded-full border border-border-strong text-foreground transition-colors hover:border-achieve-blue hover:bg-achieve-soft disabled:opacity-30";

export function SwipeCarousel({items, label, loop = false, dimSides = true, controls, controlsClassName, slideClassName, className, style}: SwipeCarouselProps) {
    const [swiper, setSwiper] = useState<SwiperInstance | null>(null);
    const [edges, setEdges] = useState({atStart: !loop, atEnd: !loop && items.length <= 1});

    const syncEdges = (instance: SwiperInstance) =>
        setEdges({atStart: !loop && instance.isBeginning, atEnd: !loop && instance.isEnd});

    // Without a loop, three cards in view would open on the first card with
    // an empty space to its left. Start one card in so all three show.
    const fillTheRow = (instance: SwiperInstance) => {
        if (loop) return;
        const perView = instance.params.slidesPerView;
        if (typeof perView === "number" && perView > 1 && instance.activeIndex === 0) {
            instance.slideTo(Math.min(Math.floor(perView / 2), items.length - 1), 0);
        }
    };

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
                modules={[A11y, EffectCoverflow, Mousewheel]}
                tabIndex={0}
                effect="coverflow"
                coverflowEffect={{
                    // Side cards turn in a little and sit further back.
                    rotate: 12,
                    depth: 180,
                    stretch: 0,
                    scale: 0.92,
                    modifier: 1,
                    slideShadows: false,
                }}
                slidesPerView={1}
                spaceBetween={16}
                centeredSlides
                loop={loop}
                breakpoints={{[WIDE_FROM]: {slidesPerView: WIDE_CARDS, spaceBetween: 24}}}
                speed={prefersReducedMotion() ? 0 : 450}
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
                    fillTheRow(instance);
                    syncEdges(instance);
                }}
                onBreakpoint={(instance) => {
                    // Breakpoint params apply after this event fires.
                    requestAnimationFrame(() => {
                        fillTheRow(instance);
                        syncEdges(instance);
                    });
                }}
                onSlideChange={syncEdges}
                onResize={syncEdges}
                className={cn("swipe-carousel pb-2", dimSides && "swipe-carousel--dim", className)}
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
