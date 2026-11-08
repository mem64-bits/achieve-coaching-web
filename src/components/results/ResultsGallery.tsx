import {useRef, useState, type CSSProperties} from "react";
import {ChevronLeft, ChevronRight, Expand} from "lucide-react";
import {GALLERY_LABELS} from "@constants/results";
import type {GalleryPhoto} from "@/types/results";
import {ResponsivePicture} from "@/components/common/ResponsivePicture";
import {Lightbox} from "./Lightbox";
import {prefersReducedMotion, scrollItemIntoCenter, useSnapIndex} from "./useSnapIndex";

interface ResultsGalleryProps {
    photos: GalleryPhoto[];
}

const stepButton =
    "grid size-11 place-items-center rounded-full border border-border-strong text-foreground transition-colors hover:border-achieve-blue hover:bg-achieve-soft disabled:opacity-30";

export default function ResultsGallery({photos}: ResultsGalleryProps) {
    const trackRef = useRef<HTMLUListElement>(null);
    const [openIndex, setOpenIndex] = useState<number | null>(null);
    const activeIndex = useSnapIndex(trackRef, photos.length);

    const step = (offset: number) => {
        const target = Math.min(Math.max(activeIndex + offset, 0), photos.length - 1);
        scrollItemIntoCenter(trackRef.current, target, prefersReducedMotion() ? "instant" : "smooth");
    };

    return (
        <div>
            <ul
                ref={trackRef}
                style={{"--first-ar": photos[0]?.aspectRatio ?? 1, "--last-ar": photos.at(-1)?.aspectRatio ?? 1} as CSSProperties}
                className="snap-row -mx-gutter pb-2 [--thumb-h:min(58svh,max(26rem,calc(var(--col)*106.7)))] ps-[max(var(--page-gutter),calc(50%+var(--page-gutter)-var(--thumb-h)*var(--first-ar)/2))] pe-[max(var(--page-gutter),calc(50%+var(--page-gutter)-var(--thumb-h)*var(--last-ar)/2))]"
            >
                {photos.map((photo, index) => (
                    <li key={photo.id} className="shrink-0">
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
                    </li>
                ))}
            </ul>

            <div className="mt-4 flex items-center justify-between gap-4">
                <button type="button" onClick={() => step(-1)} disabled={activeIndex === 0} aria-label={GALLERY_LABELS.previous} className={stepButton}>
                    <ChevronLeft aria-hidden="true" className="size-5"/>
                </button>
                <button
                    type="button"
                    onClick={() => step(1)}
                    disabled={activeIndex === photos.length - 1}
                    aria-label={GALLERY_LABELS.next}
                    className={stepButton}
                >
                    <ChevronRight aria-hidden="true" className="size-5"/>
                </button>
            </div>

            <Lightbox photos={photos} openIndex={openIndex} onClose={() => setOpenIndex(null)}/>
        </div>
    );
}
