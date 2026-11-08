import {lazy, Suspense, useEffect, useRef, useState} from "react";
import type {Swiper as SwiperInstance} from "swiper";
import {ChevronLeft, ChevronRight, X} from "lucide-react";
import {GALLERY_LABELS} from "@constants/results";
import type {GalleryPhoto} from "@/types/results";
import {BrandLoader} from "@/components/common/BrandLoader";
import {prefersReducedMotion} from "@/lib/motion";

const LightboxSwiper = lazy(() => import("./LightboxSwiper"));

interface LightboxProps {
    photos: GalleryPhoto[];
    openIndex: number | null;
    onClose: () => void;
}

const iconButton =
    "grid size-12 place-items-center rounded-full border border-white/15 bg-black/60 text-white backdrop-blur transition-colors hover:border-achieve-blue hover:bg-achieve-blue/20 disabled:opacity-30";

export function Lightbox({photos, openIndex, onClose}: LightboxProps) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const swiperRef = useRef<SwiperInstance | null>(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const isOpen = openIndex !== null;

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog || openIndex === null) {
            return;
        }
        setActiveIndex(openIndex);
        if (!dialog.open) {
            dialog.showModal();
        }
    }, [openIndex]);

    const close = () => dialogRef.current?.close();

    const handleClose = () => {
        swiperRef.current = null;
        onClose();
    };

    return (
        <dialog
            ref={dialogRef}
            aria-label={GALLERY_LABELS.dialogLabel}
            onClose={handleClose}
            className="lightbox m-0 h-dvh max-h-none w-screen max-w-none bg-transparent p-0 text-white"
        >
            {isOpen && (
                <div className="flex h-full flex-col animate-in fade-in-0 duration-200 motion-reduce:animate-none">
                    <div className="flex items-center justify-end gap-4 px-gutter pt-[max(1rem,env(safe-area-inset-top))]">
                        <p className="sr-only" aria-live="polite">
                            {GALLERY_LABELS.counter(activeIndex + 1, photos.length)}
                        </p>
                        <button type="button" autoFocus onClick={close} aria-label={GALLERY_LABELS.close} className={iconButton}>
                            <X aria-hidden="true" className="size-6"/>
                        </button>
                    </div>

                    <div className="min-h-0 grow">
                        <Suspense fallback={<div className="grid h-full place-items-center"><BrandLoader label="Loading photos" className="size-16"/></div>}>
                            <LightboxSwiper
                                photos={photos}
                                initialIndex={openIndex}
                                reducedMotion={prefersReducedMotion()}
                                onReady={(swiper) => {
                                    swiperRef.current = swiper;
                                }}
                                onIndexChange={setActiveIndex}
                                onEmptySpaceTap={close}
                            />
                        </Suspense>
                    </div>

                    <div className="flex items-center justify-center gap-6 px-gutter pb-[max(1.25rem,env(safe-area-inset-bottom))]">
                        <button
                            type="button"
                            onClick={() => swiperRef.current?.slidePrev()}
                            disabled={activeIndex === 0}
                            aria-label={GALLERY_LABELS.previous}
                            className={iconButton}
                        >
                            <ChevronLeft aria-hidden="true" className="size-6"/>
                        </button>
                        <button
                            type="button"
                            onClick={() => swiperRef.current?.slideNext()}
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
