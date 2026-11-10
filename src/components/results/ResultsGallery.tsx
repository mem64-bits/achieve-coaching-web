import {useState} from "react";
import {itemsToPreload} from "@/lib/carousel/circular";
import {Expand} from "lucide-react";
import {GALLERY_LABELS} from "@constants/results";
import type {GalleryPhoto} from "@/types/results";
import {ResponsivePicture} from "@/components/common/ResponsivePicture";
import {SwipeCarousel} from "@/components/common/SwipeCarousel";
import {cn} from "@/lib/utils";
import {Lightbox} from "./Lightbox";

// Card shape (width / height), and how far a photo's own
// shape can be from it before we stop cropping and show it whole instead.
const CARD_RATIO = 3 / 4;
const CROP_TOLERANCE = 0.06;

interface ResultsGalleryProps {
    photos: GalleryPhoto[];
}

export default function ResultsGallery({photos}: ResultsGalleryProps) {
    const [openIndex, setOpenIndex] = useState<number | null>(null);
    // Photos to fetch now rather than when they reach the screen: the batch
    // in view and one batch either side, wrapping round the list. Lazy
    // loading alone waits until a photo is nearly visible, which on a slow
    // connection leaves the incoming batch blank as it slides in.
    const [preload, setPreload] = useState(() => itemsToPreload(0, 1, photos.length));

    const items = photos.map((photo, index) => ({
        key: photo.id,
        // Every photo sits in an equal 3:4 card. Photos close to that shape
        // fill it; squares (before/after pairs) and tall shots are shown
        // whole, so nobody gets cropped out of a comparison. The gaps that
        // leaves get a soft, dark wash of the photo's own colours
        // (PhotoBackdrop) rather than its 16px placeholder stretched to fit,
        // which showed as smeared bands above and below the photo.
        // The card itself isn't a button, so on a computer clicking or
        // dragging the photo only moves the carousel. The full-size viewer
        // opens from the button in the corner. On touch screens that same
        // button stretches over the whole card, because a tap and a swipe
        // are easy to tell apart there.
        content: (
            <div className="group relative isolate w-full transform-gpu overflow-hidden rounded-2xl bg-card transition-shadow duration-300 after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:border after:border-white/10 after:transition-colors after:duration-300 hover:shadow-[0_0_30px_var(--achieve-blue-glow)] hover:after:border-achieve-blue/60">
                {isLetterboxed(photo) && <PhotoBackdrop placeholder={photo.thumb.placeholder}/>}
                <ResponsivePicture
                    image={photo.thumb}
                    // A letterboxed photo's own background would be the
                    // stretched placeholder again, so it's left clear.
                    showPlaceholder={!isLetterboxed(photo)}
                    loading={preload.has(index) ? "eager" : "lazy"}
                    draggable={false}
                    className={cn(
                        "relative block aspect-[3/4] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none",
                        isLetterboxed(photo) && "object-contain",
                    )}
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

// Shown whole inside the card rather than cropped to fill it.
function isLetterboxed(photo: GalleryPhoto): boolean {
    return Math.abs(photo.aspectRatio - CARD_RATIO) > CROP_TOLERANCE;
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
