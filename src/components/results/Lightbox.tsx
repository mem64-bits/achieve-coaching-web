import {useEffect, useRef, type KeyboardEvent, type MouseEvent} from "react";
import {ChevronLeft, ChevronRight, X} from "lucide-react";
import {GALLERY_LABELS} from "@constants/results";
import type {GalleryPhoto} from "@/types/results";
import {prefersReducedMotion, scrollItemIntoCenter, useSnapIndex} from "./useSnapIndex";

interface LightboxProps {
    photos: GalleryPhoto[];
    openIndex: number | null;
    onClose: () => void;
}

const iconButton =
    "grid size-12 place-items-center rounded-full border border-white/15 bg-black/60 text-white backdrop-blur transition-colors hover:border-achieve-blue hover:bg-achieve-blue/20 disabled:opacity-30";

export function Lightbox({photos, openIndex, onClose}: LightboxProps) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const trackRef = useRef<HTMLUListElement>(null);
    const isOpen = openIndex !== null;
    const activeIndex = useSnapIndex(trackRef, isOpen ? photos.length : 0);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog || !isOpen) {
            return;
        }

        if (!dialog.open) {
            dialog.showModal();
        }
        scrollItemIntoCenter(trackRef.current, openIndex, "instant");
    }, [isOpen, openIndex]);

    const step = (offset: number) => {
        const target = Math.min(Math.max(activeIndex + offset, 0), photos.length - 1);
        scrollItemIntoCenter(trackRef.current, target, prefersReducedMotion() ? "instant" : "smooth");
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLDialogElement>) => {
        if (event.key === "ArrowRight") {
            event.preventDefault();
            step(1);
        } else if (event.key === "ArrowLeft") {
            event.preventDefault();
            step(-1);
        }
    };

    const closeOnEmptySpace = (event: MouseEvent<HTMLElement>) => {
        if (event.target === event.currentTarget) {
            dialogRef.current?.close();
        }
    };

    return (
        <dialog
            ref={dialogRef}
            aria-label={GALLERY_LABELS.dialogLabel}
            onClose={onClose}
            onKeyDown={handleKeyDown}
            className="lightbox m-0 h-dvh max-h-none w-screen max-w-none bg-transparent p-0 text-white"
        >
            {isOpen && (
                <div className="flex h-full flex-col animate-in fade-in-0 duration-200 motion-reduce:animate-none">
                    <div className="flex items-center justify-between gap-4 px-gutter pt-[max(1rem,env(safe-area-inset-top))]">
                        <p className="font-display text-sm font-bold tracking-[0.2em] text-subtle" aria-live="polite">
                            {GALLERY_LABELS.counter(activeIndex + 1, photos.length)}
                        </p>
                        <form method="dialog">
                            <button type="submit" autoFocus aria-label={GALLERY_LABELS.close} className={iconButton}>
                                <X aria-hidden="true" className="size-6"/>
                            </button>
                        </form>
                    </div>

                    <ul ref={trackRef} className="snap-row min-h-0 grow items-stretch gap-0">
                        {photos.map((photo) => (
                            <li
                                key={photo.id}
                                onClick={closeOnEmptySpace}
                                className="flex w-full shrink-0 items-center justify-center px-gutter py-4"
                            >
                                <img
                                    src={photo.full.src}
                                    srcSet={photo.full.srcSet}
                                    sizes={photo.full.sizes}
                                    width={photo.full.width}
                                    height={photo.full.height}
                                    alt={photo.full.alt}
                                    loading="lazy"
                                    decoding="async"
                                    className="h-auto max-h-full w-auto max-w-full rounded-xl object-contain shadow-2xl"
                                />
                            </li>
                        ))}
                    </ul>

                    <div className="flex items-center justify-center gap-6 px-gutter pb-[max(1.25rem,env(safe-area-inset-bottom))]">
                        <button type="button" onClick={() => step(-1)} disabled={activeIndex === 0} aria-label={GALLERY_LABELS.previous} className={iconButton}>
                            <ChevronLeft aria-hidden="true" className="size-6"/>
                        </button>
                        <button
                            type="button"
                            onClick={() => step(1)}
                            disabled={activeIndex === photos.length - 1}
                            aria-label={GALLERY_LABELS.next}
                            className={iconButton}
                        >
                            <ChevronRight aria-hidden="true" className="size-6"/>
                        </button>
                    </div>
                </div>
            )}
        </dialog>
    );
}
