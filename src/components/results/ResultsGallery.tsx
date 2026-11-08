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
        // fill it; squares (before/after pairs) and tall shots
        // are shown whole, with their blurred placeholder filling the gaps,
        // so nobody gets cropped out of a comparison.
        content: (
            <button
                type="button"
                onClick={() => setOpenIndex(index)}
                // Position in RESULT_PHOTOS, for the browser tests.
                data-photo-index={index}
                className="group relative block w-full transform-gpu overflow-hidden rounded-2xl bg-card transition-shadow duration-300 after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:border after:border-white/10 after:transition-colors after:duration-300 hover:shadow-[0_0_30px_var(--achieve-blue-glow)] hover:after:border-achieve-blue/60"
            >
                <ResponsivePicture
                    image={photo.thumb}
                    loading={preload.has(index) ? "eager" : "lazy"}
                    className={cn(
                        "block aspect-[3/4] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none",
                        Math.abs(photo.aspectRatio - CARD_RATIO) > CROP_TOLERANCE && "object-contain",
                    )}
                />
                <span className="sr-only">{GALLERY_LABELS.openPhoto(index + 1, photos.length)}</span>
                <span
                    aria-hidden="true"
                    className="absolute right-3 bottom-3 grid size-9 place-items-center rounded-full bg-black/60 text-white opacity-90 backdrop-blur"
                >
                    <Expand className="size-4"/>
                </span>
            </button>
        ),
    }));

    return (
        <div>
            {/* Slides follow RESULT_PHOTOS order, first photo first, then round again; see tests/e2e/carousel.spec.ts. */}
            <SwipeCarousel
                items={items}
                label={GALLERY_LABELS.carousel}
                onPositionChange={(first, perView) => setPreload(itemsToPreload(first, perView, photos.length))}
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
