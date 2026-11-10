import {useState, type CSSProperties} from "react";
import {itemsToPreload} from "@/lib/carousel/circular";
import {Expand} from "lucide-react";
import {GALLERY_LABELS} from "@constants/results";
import type {GalleryPhoto} from "@/types/results";
import {ResponsivePicture} from "@/components/common/ResponsivePicture";
import {SwipeCarousel} from "@/components/common/SwipeCarousel";
import {cn} from "@/lib/utils";
import {Lightbox} from "./Lightbox";

// What a photo card does when the pointer is over it (computers only):
// - "none": nothing but the blue edge glow. The live page, for now.
// - "zoom": the photo grows by 3%. The old effect, kept to switch back to.
// - "reveal": zoom out to show the whole photo, on a soft backdrop. Being
//   tried on /lab/photo-reveal.
export type PhotoHover = "none" | "zoom" | "reveal";

// Card shape, width / height.
const CARD_RATIO = 3 / 4;
// A photo this close to the card's shape has nothing to reveal; "reveal"
// gives it a slight brightness lift instead so every card still responds.
const NOTHING_TO_REVEAL = 1.04;

interface ResultsGalleryProps {
    photos: GalleryPhoto[];
    hover?: PhotoHover;
}

export default function ResultsGallery({photos, hover = "none"}: ResultsGalleryProps) {
    const [openIndex, setOpenIndex] = useState<number | null>(null);
    // Photos to fetch now rather than when they reach the screen: the batch
    // in view and one batch either side, wrapping round the list. Lazy
    // loading alone waits until a photo is nearly visible, which on a slow
    // connection leaves the incoming batch blank as it slides in.
    const [preload, setPreload] = useState(() => itemsToPreload(0, 1, photos.length));

    const items = photos.map((photo, index) => ({
        key: photo.id,
        // Every photo is zoomed to fill an equal 3:4 card, so squarer and
        // taller shots lose their edges here (the viewer shows them whole).
        // A photo marked showWhole in RESULT_PHOTOS sits whole in its card
        // instead, on a soft, dark wash of its own colours (PhotoBackdrop)
        // rather than its 16px placeholder stretched to fit, which showed as
        // smeared bands above and below the photo.
        // The card itself isn't a button, so on a computer clicking or
        // dragging the photo only moves the carousel. The full-size viewer
        // opens from the button in the corner. On touch screens that same
        // button stretches over the whole card, because a tap and a swipe
        // are easy to tell apart there.
        content: (
            <div className="group relative isolate w-full transform-gpu overflow-hidden rounded-2xl bg-card transition-shadow duration-300 after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:border after:border-white/10 after:transition-colors after:duration-300 hover:shadow-[0_0_30px_var(--achieve-blue-glow)] hover:after:border-achieve-blue/60">
                {showsBackdrop(photo, hover) && <PhotoBackdrop placeholder={photo.thumb.placeholder}/>}
                <ResponsivePicture
                    image={photo.thumb}
                    // With a backdrop the photo's own background would be the
                    // stretched placeholder again, so it's left clear.
                    showPlaceholder={!showsBackdrop(photo, hover)}
                    loading={preload.has(index) ? "eager" : "lazy"}
                    draggable={false}
                    className={cn("relative block aspect-[3/4] w-full", photoHoverClasses(photo, hover))}
                    style={hover === "reveal" ? ({"--fill": fillScale(photo)} as CSSProperties) : undefined}
                />
                <button
                    type="button"
                    onClick={() => setOpenIndex(index)}
                    aria-label={GALLERY_LABELS.openPhoto(index + 1, photos.length)}
                    title={GALLERY_LABELS.viewFullSize}
                    // Position in RESULT_PHOTOS, for the browser tests.
                    data-photo-index={index}
                    className="group/open absolute right-3 bottom-3 z-10 grid size-11 place-items-center rounded-full outline-offset-2 focus-visible:outline-2 focus-visible:outline-achieve-blue pointer-coarse:inset-0 pointer-coarse:size-auto pointer-coarse:place-items-end pointer-coarse:rounded-[inherit] pointer-coarse:p-3 pointer-coarse:outline-offset-[-3px]"
                >
                    <span
                        aria-hidden="true"
                        className="grid size-11 place-items-center rounded-full border border-white/15 bg-black/60 text-white backdrop-blur transition-colors group-hover/open:border-achieve-blue group-hover/open:bg-achieve-blue pointer-coarse:size-9"
                    >
                        <Expand className="size-4"/>
                    </span>
                </button>
            </div>
        ),
    }));

    return (
        <div>
            {/* Slides follow RESULT_PHOTOS order, first photo first, then round again; see tests/e2e/carousel.spec.ts. */}
            <SwipeCarousel
                items={items}
                label={GALLERY_LABELS.carousel}
                onPositionChange={(first, perView) => {
                    // This fires many times a second while dragging; only
                    // re-render when the set of photos to load changes.
                    const next = itemsToPreload(first, perView, photos.length);
                    setPreload((current) => (sameItems(current, next) ? current : next));
                }}
                controls={{previous: GALLERY_LABELS.previous, next: GALLERY_LABELS.next}}
                // Left / right keys step the photos whenever the strip is in
                // view, round and round, without clicking into it first.
                pageArrowKeys
                // One card is never wider than 26rem (tablets would otherwise
                // get a 960px-tall photo); three across are kept to 1100px so
                // each is about 350 by 467 on wide screens.
                className="mx-auto max-w-[26rem] lg:max-w-[1100px]"
                controlsClassName="mx-auto max-w-[26rem] lg:max-w-[1100px]"
            />

            <Lightbox photos={photos} openIndex={openIndex} onClose={() => setOpenIndex(null)}/>
        </div>
    );
}

function sameItems(a: Set<number>, b: Set<number>): boolean {
    return a.size === b.size && [...a].every((item) => b.has(item));
}

// Shown whole inside the card rather than zoomed to fill it.
function isLetterboxed(photo: GalleryPhoto): boolean {
    return photo.showWhole;
}

// How much a photo shown whole (object-contain) must grow to fill the card:
// 1 for a 3:4 photo, about 1.33 for a square one.
function fillScale(photo: GalleryPhoto): number {
    const ratio = photo.aspectRatio;
    return Math.max(ratio / CARD_RATIO, CARD_RATIO / ratio);
}

// "reveal" shows the space around every photo it can zoom out of.
function showsBackdrop(photo: GalleryPhoto, hover: PhotoHover): boolean {
    return isLetterboxed(photo) || (hover === "reveal" && fillScale(photo) > NOTHING_TO_REVEAL);
}

function photoHoverClasses(photo: GalleryPhoto, hover: PhotoHover): string {
    if (hover === "reveal") {
        // Laid out whole and scaled up to fill (styles in effects.css), so
        // hovering only has to animate the scale back to 1. A photo marked
        // showWhole starts whole and stays put.
        if (isLetterboxed(photo)) return "object-contain";
        return fillScale(photo) > NOTHING_TO_REVEAL ? "object-contain photo-reveal" : "object-cover photo-lift";
    }
    const fit = isLetterboxed(photo) ? "object-contain" : "object-cover";
    if (hover === "zoom") {
        return cn(fit, "transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none");
    }
    return fit;
}

// Fills the space around a letterboxed photo. The 16px placeholder is a
// rough average of the photo's colours; blurring it hard in the browser
// turns its blocky pixels into a smooth wash, scaled up so the blur's soft
// edge sits outside the card, and darkened so it reads as background.
function PhotoBackdrop({placeholder}: {placeholder?: string}) {
    return (
        <span
            aria-hidden="true"
            className="absolute inset-0 -z-10 scale-125 bg-cover bg-center blur-2xl brightness-[0.4] saturate-[0.8]"
            style={placeholder ? {backgroundImage: `url("${placeholder}")`} : undefined}
        />
    );
}
