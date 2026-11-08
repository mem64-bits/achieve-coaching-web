import {useState} from "react";
import {Expand} from "lucide-react";
import {GALLERY_LABELS} from "@constants/results";
import type {GalleryPhoto} from "@/types/results";
import {ResponsivePicture} from "@/components/common/ResponsivePicture";
import {SwipeCarousel, cardsPerView} from "@/components/common/SwipeCarousel";
import {cn} from "@/lib/utils";
import {Lightbox} from "./Lightbox";

// Card shape from tablets up (width / height), and how far a photo's own
// shape can be from it before we stop cropping and show it whole instead.
const CARD_RATIO = 3 / 4;
const CROP_TOLERANCE = 0.06;

interface ResultsGalleryProps {
    photos: GalleryPhoto[];
}

export default function ResultsGallery({photos}: ResultsGalleryProps) {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const items = photos.map((photo, index) => ({
        key: photo.id,
        // From tablets up every photo sits in an equal 3:4 card. Photos close
        // to that shape fill it; squares (before/after pairs) and tall shots
        // are shown whole, with their blurred placeholder filling the gaps,
        // so nobody gets cropped out of a comparison.
        content: (
            <button
                type="button"
                onClick={() => setOpenIndex(index)}
                className="group relative block transform-gpu md:w-full overflow-hidden rounded-2xl bg-card transition-shadow duration-300 after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:border after:border-white/10 after:transition-colors after:duration-300 hover:shadow-[0_0_30px_var(--achieve-blue-glow)] hover:after:border-achieve-blue/60"
            >
                <ResponsivePicture
                    image={photo.thumb}
                    className={cn(
                        "block h-(--thumb-h) w-auto max-w-none object-cover transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none",
                        "md:aspect-[3/4] md:h-auto md:w-full md:max-w-full",
                        Math.abs(photo.aspectRatio - CARD_RATIO) > CROP_TOLERANCE && "md:object-contain",
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
            <SwipeCarousel
                items={items}
                label={GALLERY_LABELS.carousel}
                controls={{previous: GALLERY_LABELS.previous, next: GALLERY_LABELS.next}}
                breakpoints={cardsPerView(photos.length)}
                controlsClassName="mx-auto max-w-[1280px]"
                // Phones: each photo is 26rem tall (never more than 58% of a
                // short screen) and as wide as that makes it.
                className="[--thumb-h:min(58svh,26rem)]"
                slideClassName="w-auto"
            />

            <Lightbox photos={photos} openIndex={openIndex} onClose={() => setOpenIndex(null)}/>
        </div>
    );
}
