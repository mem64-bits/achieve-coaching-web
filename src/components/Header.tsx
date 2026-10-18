import React, {useState, useEffect} from 'react';
import AchieveSeparator from "@components/AchieveSeparator.tsx";
import {PATHS} from "@constants/navigation.ts";

export default function Header({children}: { children?: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 15);
        window.addEventListener('scroll', handleScroll, {passive: true});
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header
            className={`
                sticky top-0 z-50 w-full transition-all duration-500 ease-in-out
                ${isOpen
                ? 'py-3 bg-[#050505]' // Solid when menu is open to kill background noise
                : scrolled
                    ? 'py-3 bg-[#050505]/85 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.8)]'
                    : 'py-6 bg-black/10 backdrop-blur-sm'}
            `}
        >
            {/* Top Accent Rim Light */}
            <div
                className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-white/10 to-transparent"/>

            <div className="max-w-360 mx-auto flex items-center justify-between px-6 md:px-12 lg:px-16">

                <div className="flex items-center gap-12">
                    {/* Brand Logo Container */}
                    <div
                        className="hover:opacity-80 transition-opacity cursor-pointer relative z-20 flex items-center">
                        {/* Wrap the logo in a link */}
                        <a href={PATHS.HOME}
                           className="hover:opacity-80 transition-opacity cursor-pointer relative z-20 flex items-center">
                            {children}
                        </a>
                    </div>


                </div>

            </div>

            {/* Permanent Blue Separator */}
            <div className="absolute -bottom-px left-0 right-0 w-full z-60">
                <AchieveSeparator
                    thickness="2px"
                    variant="glow"
                    color="#3b43c1"
                />
            </div>
        </header>
    );
}