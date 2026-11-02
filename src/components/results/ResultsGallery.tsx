import {useRef, useState} from "react";
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
                className="snap-row -mx-gutter px-gutter pb-2 lg:mx-0 lg:block lg:columns-3 lg:gap-4 lg:overflow-visible lg:px-0 lg:pb-0"
            >
                {photos.map((photo, index) => (
                    <li key={photo.id} className="shrink-0 lg:mb-4 lg:break-inside-avoid">
                        <button
                            type="button"
                            onClick={() => setOpenIndex(index)}
                            className="group relative block overflow-hidden rounded-2xl border border-white/10 bg-card transition-[border-color,box-shadow] duration-300 hover:border-achieve-blue/60 hover:shadow-[0_0_30px_var(--achieve-blue-glow)] lg:w-full"
                        >
                            <ResponsivePicture
                                image={photo.thumb}
                                className="block h-[min(58svh,26rem)] w-auto max-w-none object-cover transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none md:h-[30rem] lg:h-auto lg:w-full lg:max-w-full"
                            />
                            <span className="sr-only">{GALLERY_LABELS.openPhoto(index + 1, photos.length)}</span>
                            {photo.kind === "transformation" && (
                                <span className="absolute top-3 left-3 rounded-full bg-black/70 px-3 py-1 font-display text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-white backdrop-blur">
                                    {GALLERY_LABELS.transformationBadge}
                                </span>
                            )}
                            <span
                                aria-hidden="true"
                                className="absolute right-3 bottom-3 grid size-9 place-items-center rounded-full bg-black/60 text-white opacity-90 backdrop-blur transition-opacity lg:opacity-0 lg:group-hover:opacity-100 lg:group-focus-visible:opacity-100"
                            >
                                <Expand className="size-4"/>
                            </span>
                        </button>
                    </li>
                ))}
            </ul>

            <div className="mt-4 flex items-center justify-between gap-4 lg:hidden">
                <button type="button" onClick={() => step(-1)} disabled={activeIndex === 0} aria-label={GALLERY_LABELS.previous} className={stepButton}>
                    <ChevronLeft aria-hidden="true" className="size-5"/>
                </button>
                <p className="font-display text-sm font-bold tracking-[0.2em] text-muted-foreground">
                    {GALLERY_LABELS.counter(activeIndex + 1, photos.length)}
                </p>
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
