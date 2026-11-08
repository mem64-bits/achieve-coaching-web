import {useState} from "react";
import {Expand} from "lucide-react";
import {GALLERY_LABELS} from "@constants/results";
import type {GalleryPhoto} from "@/types/results";
import {ResponsivePicture} from "@/components/common/ResponsivePicture";
import {SwipeCarousel} from "@/components/common/SwipeCarousel";
import {Lightbox} from "./Lightbox";

interface ResultsGalleryProps {
    photos: GalleryPhoto[];
}

export default function ResultsGallery({photos}: ResultsGalleryProps) {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const items = photos.map((photo, index) => ({
        key: photo.id,
        content: (
            <button
                type="button"
                onClick={() => setOpenIndex(index)}
                className="group relative block transform-gpu overflow-hidden rounded-2xl bg-card transition-shadow duration-300 after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:border after:border-white/10 after:transition-colors after:duration-300 hover:shadow-[0_0_30px_var(--achieve-blue-glow)] hover:after:border-achieve-blue/60"
            >
                <ResponsivePicture
                    image={photo.thumb}
                    className="block h-(--thumb-h) w-auto max-w-none object-cover transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none"
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
                // Photo height: 26rem on a phone, growing with the page column
                // (about 640px on wider screens), never more than 58% of a
                // short screen. Each photo is as wide as that height makes it.
                className="[--thumb-h:min(58svh,max(26rem,calc(var(--col)*106.7)))]"
                slideClassName="w-auto"
            />

            <Lightbox photos={photos} openIndex={openIndex} onClose={() => setOpenIndex(null)}/>
        </div>
    );
}
