import {useEffect, useRef, useState, type CSSProperties, type ReactNode} from "react";
import {Swiper, SwiperSlide} from "swiper/react";
import {A11y, Mousewheel} from "swiper/modules";
import type {Swiper as SwiperInstance} from "swiper";
import {ChevronLeft, ChevronRight} from "lucide-react";
import {prefersReducedMotion} from "@/lib/motion";
import {cn} from "@/lib/utils";

// The one carousel the site uses, built on Swiper so it behaves the same
// everywhere: swipe on a phone, drag with a mouse, side-scroll on a
// trackpad, arrow keys once it has focus.
//
// Layout: flat cards, always in the order they're given, starting with the
// first. Phones and tablets show exactly one card, so the only way on is to
// swipe (or tap an arrow). From 1024px three sit side by side.
//
// Movement: the list is circular when it's long enough. After the last card
// comes the first again, in the same order. A swipe, drag or trackpad
// gesture moves one card; the arrow buttons and arrow keys move a whole
// batch (one on phones, three from 1024px) with a slower, smoother slide,
// so the next set of photos glides in as a group.
//
// Swiper's stylesheet is imported into the base layer in global.css, so
// Tailwind classes here win over it.

export interface SwipeCarouselItem {
    key: string;
    content: ReactNode;
}

export interface SwipeCarouselProps {
    items: SwipeCarouselItem[];
    // Told which item is leftmost and how many fit across, whenever either
    // changes. The photo gallery uses it to load the photos about to arrive.
    onPositionChange?: (first: number, perView: number) => void;
    // What the carousel holds, read out by screen readers ("Client results").
    label: string;
    // Previous / next buttons under the carousel, with these spoken names.
    controls?: {previous: string; next: string};
    controlsClassName?: string;
    slideClassName?: string;
    className?: string;
    style?: CSSProperties;
}

// Three cards side by side from this width up. Below it there's only one,
// so tablets get a single card rather than three squeezed ones.
const WIDE_FROM = 1024;
const WIDE_CARDS = 3;

// Swiper loops by moving cards from one end to the other, so moving a whole
// batch needs a spare batch on top of the one on screen. Shorter lists (the
// three reviews) stop at each end instead.
const LOOP_FROM = WIDE_CARDS * 2;

// Gestures settle quickly; a batch step takes a little longer so the move
// reads as one set of photos replacing another.
const GESTURE_SPEED = 450;
const BATCH_SPEED = 700;

// Swiper won't start a swipe on anything in this list. Its default includes
// `button`, which would stop the photo strip (every photo is a button that
// opens the viewer) from being swiped at all.
const NO_SWIPE_ON = "input, select, option, textarea, video, label";

// Under the strip on phones and tablets; from 1024px the arrows sit on its
// left and right edges, level with the photos, where a mouse already is.
const stepButton =
    "grid size-11 place-items-center rounded-full border border-border-strong text-foreground transition-colors hover:border-achieve-blue hover:bg-achieve-soft disabled:opacity-30 lg:pointer-events-auto lg:size-12 lg:border-white/20 lg:bg-black/65 lg:backdrop-blur lg:hover:bg-achieve-blue";

export function SwipeCarousel({items, label, onPositionChange, controls, controlsClassName, slideClassName, className, style}: SwipeCarouselProps) {
    const loop = items.length >= LOOP_FROM;
    const reduceMotion = prefersReducedMotion();
    const [swiper, setSwiper] = useState<SwiperInstance | null>(null);
    const [edges, setEdges] = useState({atStart: !loop, atEnd: !loop && items.length <= 1});

    // A looping list has no ends, so its arrows never switch off.
    const sync = (instance: SwiperInstance) => {
        setEdges({atStart: !loop && instance.isBeginning, atEnd: !loop && instance.isEnd});
        onPositionChange?.(instance.realIndex, cardsAcross(instance));
    };

    // Move a whole batch. Swiper's own batch setting would pad the loop with
    // blank cards when the count isn't a multiple of three (23 photos), so
    // this moves by hand: in a loop, first ask Swiper to shuffle cards round
    // so there's a full batch waiting on that side, then slide that far.
    // A press that arrives while a batch is still gliding is kept and run as
    // soon as that move ends, so quick taps or key presses all count.
    const queued = useRef<1 | -1 | null>(null);

    const stepWith = (instance: SwiperInstance, direction: 1 | -1) => {
        if (instance.animating) {
            queued.current = direction;
            return;
        }
        const distance = cardsAcross(instance) * direction;
        const speed = reduceMotion ? 0 : BATCH_SPEED;
        if (loop) {
            instance.loopFix({direction: direction > 0 ? "next" : "prev"});
            // Reading layout here makes the browser apply the shuffle before
            // the slide starts, so the move animates from where the cards are.
            void instance.wrapperEl.clientLeft;
            instance.slideTo(instance.activeIndex + distance, speed);
        } else {
            const last = instance.slides.length - 1;
            instance.slideTo(Math.min(Math.max(instance.activeIndex + distance, 0), last), speed);
        }
    };

    const step = (direction: 1 | -1) => {
        if (swiper) stepWith(swiper, direction);
    };

    // Arrow keys move this carousel only while it has focus, so two carousels
    // on screen don't both move (Swiper's Keyboard module listens page-wide).
    // Attached by hand: Swiper's React wrapper treats every `on...` prop as a
    // Swiper event, so an onKeyDown prop would never reach the element.
    useEffect(() => {
        if (!swiper) return;
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "ArrowRight") step(1);
            else if (event.key === "ArrowLeft") step(-1);
            else return;
            event.preventDefault();
        };
        swiper.el.addEventListener("keydown", onKeyDown);
        return () => swiper.el.removeEventListener("keydown", onKeyDown);
    }, [swiper]);

    return (
        <div className="relative">
            <Swiper
                modules={[A11y, Mousewheel]}
                tabIndex={0}
                slidesPerView={1}
                spaceBetween={16}
                breakpoints={{[WIDE_FROM]: {slidesPerView: WIDE_CARDS, spaceBetween: 24}}}
                loop={loop}
                // A spare batch either side of the one on screen, so a batch
                // step always has cards to move into.
                loopAdditionalSlides={WIDE_CARDS}
                speed={reduceMotion ? 0 : GESTURE_SPEED}
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
                    sync(instance);
                }}
                onSlideChange={sync}
                onTransitionEnd={(instance) => {
                    const direction = queued.current;
                    queued.current = null;
                    if (direction) requestAnimationFrame(() => stepWith(instance, direction));
                }}
                onResize={sync}
                // Breakpoint params apply after this event fires.
                onBreakpoint={(instance) => requestAnimationFrame(() => sync(instance))}
                className={cn("swipe-carousel pb-2", className)}
                style={style}
            >
                {items.map((item) => (
                    <SwiperSlide key={item.key} className={slideClassName}>
                        {item.content}
                    </SwiperSlide>
                ))}
            </Swiper>

            {controls && (
                <div
                    className={cn(
                        "mt-4 flex items-center justify-between gap-4",
                        // Wide screens: laid over the strip, letting clicks
                        // through everywhere but the buttons themselves.
                        "lg:pointer-events-none lg:absolute lg:inset-x-0 lg:top-1/2 lg:z-20 lg:mt-0 lg:-translate-y-1/2 lg:px-3",
                        controlsClassName,
                    )}
                >
                    <button
                        type="button"
                        onClick={() => step(-1)}
                        disabled={edges.atStart}
                        aria-label={controls.previous}
                        className={stepButton}
                    >
                        <ChevronLeft aria-hidden="true" className="size-5"/>
                    </button>
                    <button
                        type="button"
                        onClick={() => step(1)}
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

// How many cards fit across at the current screen width.
function cardsAcross(instance: SwiperInstance): number {
    const perView = instance.params.slidesPerView;
    return typeof perView === "number" ? Math.max(1, Math.floor(perView)) : 1;
}
