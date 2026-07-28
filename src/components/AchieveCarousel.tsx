// src/components/AchieveCarousel.tsx
import React from 'react';
import {Swiper, SwiperSlide} from 'swiper/react';
import {EffectCoverflow, Autoplay, Mousewheel, Pagination} from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';

const data = [
    {
        label: "12 Week Protocol",
        client: "Alex M.",
        img: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1200"
    },
    {
        label: "Muscle Hypertrophy",
        client: "Sarah J.",
        img: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=1200"
    },
    {
        label: "Elite Recomp",
        client: "Marcus K.",
        img: "https://images.unsplash.com/photo-1534367507873-d2d7e24c797f?q=80&w=1200"
    },
    {
        label: "Strength Protocol",
        client: "Elena R.",
        img: "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?q=80&w=1200"
    },
];

export default function AchieveCarousel() {
    return (
        <div className="w-full relative py-12 group/carousel">
            <Swiper
                effect={'coverflow'}
                grabCursor={true}
                centeredSlides={true}
                loop={false} // Disabled loop for better scroll-release logic
                slidesPerView={'auto'}

                /* FIX: Scrollbar Fighting Logic */
                mousewheel={{
                    forceToAxis: true,      // Only scroll when swiping horizontally on wheel
                    releaseOnEdges: true,   // Let the page scroll again when carousel ends
                    sensitivity: 1,
                }}

                /* TRADITIONAL ELEMENT: Pagination dots transformed into Achieve segments */
                pagination={{
                    clickable: true,
                    dynamicBullets: true,
                }}

                coverflowEffect={{
                    rotate: 8,       // Subtle 3D flare
                    stretch: -20,    // Overlay overlap
                    depth: 250,      // Perspective depth
                    modifier: 1.2,   // Intensity
                    slideShadows: false,
                }}

                modules={[EffectCoverflow, Autoplay, Mousewheel, Pagination]}
                className="w-full !overflow-visible !pb-24"
            >
                {data.map((item, i) => (
                    <SwiperSlide key={i} className="!w-[310px] sm:!w-[480px]">
                        {({isActive}) => (
                            <div className={`
                                relative aspect-[4/5] rounded-[42px] overflow-hidden border transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]
                                ${isActive
                                ? 'border-achieve-blue/50 shadow-[0_20px_80px_-20px_rgba(59,67,193,0.35)] translate-y-0 opacity-100 scale-100'
                                : 'border-white/5 opacity-30 scale-[0.82] translate-y-16 blur-[1px]'}
                            `}>

                                {/* Background with slight zoom flare */}
                                <div
                                    className={`absolute inset-0 bg-cover bg-center transition-transform duration-[3000ms] 
                                    ${isActive ? 'scale-105 grayscale-0' : 'scale-125 grayscale'}`}
                                    style={{backgroundImage: `url(${item.img})`}}
                                />

                                {/* High-End Gradient Vignette */}
                                <div
                                    className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"/>

                                {/* Content Layer */}
                                <div className={`absolute bottom-10 left-10 right-10 z-20 transition-all duration-700 delay-100 
                                    ${isActive ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-8 h-[2px] bg-achieve-blue rounded-full"></div>
                                        <span
                                            className="text-achieve-blue font-bold tracking-[0.4em] uppercase text-[9px]">
                                            {item.label}
                                        </span>
                                    </div>
                                    <h3 className="text-3xl font-black uppercase tracking-tighter text-white">
                                        {item.client}
                                    </h3>
                                </div>
                            </div>
                        )}
                    </SwiperSlide>
                ))}
            </Swiper>

            {/* TRADITIONAL FLARE: Custom CSS for Pagination to make it Achieve-branded */}
            <style dangerouslySetInnerHTML={{
                __html: `
                .swiper-pagination-bullets {
                    bottom: 0px !important;
                }
                .swiper-pagination-bullet {
                    background: #1a1a1a !important;
                    opacity: 1 !important;
                    width: 12px !important;
                    height: 4px !important;
                    border-radius: 2px !important;
                    transition: all 0.3s !important;
                }
                .swiper-pagination-bullet-active {
                    background: #3b43c1 !important;
                    width: 40px !important;
                    box-shadow: 0 0 15px rgba(59, 67, 193, 0.6);
                }
            `
            }}/>
        </div>
    );
}