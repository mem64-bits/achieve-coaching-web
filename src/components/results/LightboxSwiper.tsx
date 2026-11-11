import {Swiper, SwiperSlide} from "swiper/react";
import {A11y, Keyboard, Zoom} from "swiper/modules";
import type {Swiper as SwiperInstance} from "swiper";
// Swiper's core stylesheet is imported once, layered, in global.css.
import "swiper/css/zoom";
import {BrandLoader} from "@/components/common/BrandLoader";
import {ResponsivePicture} from "@/components/common/ResponsivePicture";
import type {GalleryPhoto} from "@/types/results";

export interface LightboxSwiperProps {
    photos: GalleryPhoto[];
    initialIndex: number;
    reducedMotion: boolean;
    onReady: (swiper: SwiperInstance) => void;
    onIndexChange: (index: number) => void;
    onEmptySpaceTap: () => void;
}

const EMPTY_SPACE_CLASSES = ["swiper-slide", "swiper-zoom-container"];

export default function LightboxSwiper({
    photos,
    initialIndex,
    reducedMotion,
    onReady,
    onIndexChange,
    onEmptySpaceTap,
}: LightboxSwiperProps) {
    return (
        <Swiper
            modules={[Zoom, Keyboard, A11y]}
            // A ring, like the strip: after the last photo comes the first,
            // by arrow key, button or swipe.
            loop={photos.length > 1}
            // Swiper ignores presses during a slide when looping; quick
            // repeated arrow presses should each count.
            loopPreventsSliding={false}
            spaceBetween={16}
            speed={reducedMotion ? 0 : 320}
            zoom={{maxRatio: 3, toggle: true}}
            keyboard={{enabled: true}}
            a11y={{enabled: true, containerRoleDescriptionMessage: "photo viewer", itemRoleDescriptionMessage: "photo"}}
            lazyPreloadPrevNext={1}
            lazyPreloaderClass="lightbox-preloader"
            onSwiper={(swiper) => {
                // In loop mode Swiper's initialSlide lands on the first photo
                // when asked for the last one, so open on it directly.
                swiper.slideToLoop(initialIndex, 0, false);
                onReady(swiper);
            }}
            onSlideChange={(swiper) => onIndexChange(swiper.realIndex)}
            onClick={(_swiper, event) => {
                const target = event.target as HTMLElement | null;
                if (target && EMPTY_SPACE_CLASSES.some((name) => target.classList.contains(name))) {
                    onEmptySpaceTap();
                }
            }}
            className="h-full w-full"
        >
            {photos.map((photo) => (
                <SwiperSlide key={photo.id} className="flex! items-center justify-center px-gutter py-4">
                    <div className="swiper-zoom-container">
                        <ResponsivePicture
                            image={photo.full}
                            showPlaceholder={false}
                            className="h-auto max-h-full w-auto max-w-full rounded-xl object-contain shadow-2xl"
                        />
                    </div>
                    <div className="lightbox-preloader pointer-events-none absolute inset-0 -z-10 grid place-items-center">
                        <BrandLoader className="size-16"/>
                    </div>
                </SwiperSlide>
            ))}
        </Swiper>
    );
}
