import {useEffect, useRef, useState, type CSSProperties, type ReactNode} from "react";
import {planGlide, releaseVelocity, type PositionSample} from "@/lib/carousel/glide";
import {Swiper, SwiperSlide} from "swiper/react";
import {A11y, FreeMode, Mousewheel} from "swiper/modules";
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
// comes the first again, in the same order. Swipes, drags and trackpad
// gestures behave like a photo row on iOS or Android: the strip carries the
// momentum of your finger, slows down on its own, then settles gently on
// the nearest card. The arrow buttons and arrow keys move a whole batch
// (one on phones, three from 1024px), easing in and out so the next set of
// photos glides in as a group.
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
    // Also answer the left / right arrow keys from anywhere on the page
    // while at least half the carousel is on screen, not only once it has
    // focus. For one carousel per page (the photos): two would both move.
    pageArrowKeys?: boolean;
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
const BATCH_SPEED = 800;

// Free mode lets the strip follow the finger exactly while dragging. Swiper's
// own momentum and snapping are off: its release picks a fixed duration
// whatever your speed, so the strip lurched to about twice the finger's
// speed when let go. The release is handled below with lib/carousel/glide.
const FOLLOW_THE_FINGER = {enabled: true, momentum: false, sticky: false};

// How far one flick may carry the strip, in cards. The loop keeps a spare
// batch of cards either side, so this stays within what's laid out.
const MAX_FLICK_CARDS = 3;
// After a trackpad or mouse-wheel scroll stops (including the trackpad's own
// inertia), settle onto the nearest card.
const WHEEL_SETTLE_DELAY_MS = 160;

// Swiper won't start a swipe on anything in this list. Its default includes
// `button`, which would stop the photo strip (every photo is a button that
// opens the viewer) from being swiped at all.
const NO_SWIPE_ON = "input, select, option, textarea, video, label";

// Under the strip on phones and tablets; from 1024px the arrows sit on its
// left and right edges, level with the photos, where a mouse already is.
const stepButton =
    "grid size-11 place-items-center rounded-full border border-border-strong text-foreground transition-colors hover:border-achieve-blue hover:bg-achieve-soft disabled:opacity-30 lg:pointer-events-auto lg:size-12 lg:border-white/20 lg:bg-black/65 lg:backdrop-blur lg:hover:bg-achieve-blue";

export function SwipeCarousel({items, label, onPositionChange, controls, controlsClassName, pageArrowKeys = false, slideClassName, className, style}: SwipeCarouselProps) {
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
        // Button moves start from rest, so they use the ease-in-out curve
        // (see effects.css); gestures keep the decelerating one.
        instance.el.dataset.move = "step";
        clearGlideCurve(instance);
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

    // Page-wide arrow keys (pageArrowKeys). Left alone when the key is meant
    // for something else: typing in a field, a dialog such as the photo
    // viewer, another carousel or this one (handled above), or a shortcut.
    useEffect(() => {
        if (!swiper || !pageArrowKeys) return;
        let mostlyOnScreen = false;
        const watcher = new IntersectionObserver(
            ([entry]) => {
                mostlyOnScreen = entry.intersectionRatio >= 0.5;
            },
            {threshold: [0, 0.5, 1]},
        );
        watcher.observe(swiper.el);

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
            if (!mostlyOnScreen || event.defaultPrevented) return;
            if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
            if (document.querySelector("dialog[open]")) return;
            const target = event.target as HTMLElement | null;
            if (target?.closest("input, textarea, select, [contenteditable], .swipe-carousel")) return;
            step(event.key === "ArrowRight" ? 1 : -1);
            event.preventDefault();
        };
        window.addEventListener("keydown", onKeyDown);
        return () => {
            watcher.disconnect();
            window.removeEventListener("keydown", onKeyDown);
        };
    }, [swiper, pageArrowKeys]);

    // Letting go: carry on at the finger's speed, slow down, and come to
    // rest on a card (see lib/carousel/glide.ts for the maths).
    useEffect(() => {
        if (!swiper) return;
        let samples: PositionSample[] = [];
        let releasedAt = 0;
        // Free mode runs its release code on touch start as well (to catch
        // a moving strip), so only act when a drag has really just ended.
        let releasing = false;
        let wheelTimer: number | undefined;

        const glide = (velocity: number) => {
            if (loop && velocity !== 0) swiper.loopFix({direction: velocity < 0 ? "next" : "prev"});
            const cardSize = (swiper.slidesSizesGrid[0] ?? 0) + Number(swiper.params.spaceBetween ?? 0);
            const plan = planGlide({
                position: swiper.translate,
                velocity,
                snaps: swiper.snapGrid.map((offset) => -offset),
                maxTravel: cardSize * MAX_FLICK_CARDS,
            });
            // Each glide brings its own easing so it starts at the speed the
            // strip already has (none, if the mouse stopped before letting go).
            if (plan.curve) swiper.wrapperEl.style.transitionTimingFunction = plan.curve;
            else clearGlideCurve(swiper);
            // Animated even with reduced motion on: it finishes the visitor's
            // own drag, like ordinary scrolling, which phones keep under that
            // setting too. Made instant, the strip jumped onto the card the
            // moment the button came up. The arrows' three-card jump is the
            // automatic motion that setting is about, and stays instant.
            // Marked as moving until the glide ends (onTransitionEnd), like
            // a step, so hover effects don't fire on cards passing the pointer.
            if (plan.duration > 0) swiper.el.dataset.move = "glide";
            swiper.slideTo(plan.index, plan.duration);
        };

        // True while a finger or mouse button is down on the strip.
        let held = false;
        const onTouchStart = () => {
            held = true;
            releasing = false;
            samples = [];
            window.clearTimeout(wheelTimer);
            delete swiper.el.dataset.move;
            clearGlideCurve(swiper);
        };
        const onSliderMove = () => {
            // Lets card hover effects stand still while the strip is held.
            swiper.el.dataset.dragging = "";
        };
        // Positions are taken when Swiper actually moves the strip. Its
        // sliderMove event comes before the move, so sampling there ran one
        // event behind and always lost the last, slowest bit of a flick:
        // the glide then set off at the speed from a moment earlier.
        const onSetTranslate = () => {
            if (!held) return;
            samples.push({time: performance.now(), position: swiper.translate});
            if (samples.length > 12) samples.shift();
        };
        const onTouchEnd = () => {
            held = false;
            delete swiper.el.dataset.dragging;
            releasing = samples.length > 0;
            releasedAt = performance.now();
            // Pressed and let go without moving. Pressing during a glide
            // stops the strip where it is, as on a phone, but Swiper counts
            // a press with no movement as nothing happening, so it never
            // settled: the strip stayed between two cards and the next drag
            // or arrow press jumped to line up. Ease onto the nearest card
            // from rest instead (after Swiper finishes its own release).
            if (!releasing) {
                requestAnimationFrame(() => {
                    if (!held && !restingOnCard(swiper)) glide(0);
                });
            }
        };
        const onRelease = () => {
            if (!releasing) return;
            releasing = false;
            glide(releaseVelocity(samples, releasedAt));
            samples = [];
        };
        const onWheel = () => {
            window.clearTimeout(wheelTimer);
            wheelTimer = window.setTimeout(() => glide(0), WHEEL_SETTLE_DELAY_MS);
        };

        swiper.on("touchStart", onTouchStart);
        swiper.on("sliderMove", onSliderMove);
        swiper.on("setTranslate", onSetTranslate);
        swiper.on("touchEnd", onTouchEnd);
        // Free mode's last word on a release, still in the same frame; acting
        // here means Swiper doesn't overwrite the target straight after.
        swiper.on("_freeModeStaticRelease", onRelease);
        swiper.on("scroll", onWheel);
        return () => {
            window.clearTimeout(wheelTimer);
            swiper.off("touchStart", onTouchStart);
            swiper.off("sliderMove", onSliderMove);
            swiper.off("setTranslate", onSetTranslate);
            swiper.off("touchEnd", onTouchEnd);
            swiper.off("_freeModeStaticRelease", onRelease);
            swiper.off("scroll", onWheel);
        };
    }, [swiper, loop]);

    return (
        // No text selection: clicking the arrows quickly counts as a
        // double-click, which selected the photos and tinted them blue.
        <div className="relative select-none">
            <Swiper
                modules={[A11y, FreeMode, Mousewheel]}
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
                freeMode={FOLLOW_THE_FINGER}
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
                    delete instance.el.dataset.move;
                    clearGlideCurve(instance);
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
// Whether the strip is lined up on a card (within half a pixel).
function restingOnCard(instance: SwiperInstance): boolean {
    return instance.snapGrid.some((snap) => Math.abs(snap + instance.translate) < 0.5);
}

// Back to the stylesheet's easing (effects.css) once a custom glide is over.
function clearGlideCurve(instance: SwiperInstance) {
    instance.wrapperEl.style.removeProperty("transition-timing-function");
}

function cardsAcross(instance: SwiperInstance): number {
    const perView = instance.params.slidesPerView;
    return typeof perView === "number" ? Math.max(1, Math.floor(perView)) : 1;
}
