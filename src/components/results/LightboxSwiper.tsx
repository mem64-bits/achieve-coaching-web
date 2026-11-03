import {Swiper, SwiperSlide} from "swiper/react";
import {A11y, Keyboard, Zoom} from "swiper/modules";
import type {Swiper as SwiperInstance} from "swiper";
import "swiper/css";
import "swiper/css/zoom";
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
            initialSlide={initialIndex}
            spaceBetween={16}
            speed={reducedMotion ? 0 : 320}
            zoom={{maxRatio: 3, toggle: true}}
            keyboard={{enabled: true}}
            a11y={{enabled: true, containerRoleDescriptionMessage: "photo viewer", itemRoleDescriptionMessage: "photo"}}
            lazyPreloadPrevNext={1}
            onSwiper={onReady}
            onSlideChange={(swiper) => onIndexChange(swiper.activeIndex)}
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
                    <div className="swiper-lazy-preloader swiper-lazy-preloader-white"/>
                </SwiperSlide>
            ))}
        </Swiper>
    );
}
