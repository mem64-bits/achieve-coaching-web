import React, {useState, useEffect} from 'react';
import {Menu} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Sheet, SheetContent, SheetTrigger} from '@/components/ui/sheet';
import {Skeleton} from '@/components/ui/skeleton';

import achieveLogo from "@images/achieve-coaching-white-outline.svg";
import {SOCIAL_LINKS} from '../constants/socials';
import SocialLinks from "@components/SocialLinks.tsx";
import AchieveSeparator from "@components/AchieveSeparator.tsx";

import {PATHS, resolveLink} from '../constants/navigation';

const navLinks = [
    {label: 'Transformations', href: PATHS.TRANSFORMATIONS},
    {label: 'Philosophy', href: PATHS.PHILOSOPHY},
    {label: 'Blogs', href: PATHS.BLOGS},
    {label: 'Practice', href: PATHS.PRACTICE},
];

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

                    {/* Desktop Navigation Island */}
                    <nav
                        className="hidden lg:flex items-center bg-white/5 p-1 rounded-2xl border border-white/5 backdrop-blur-md min-h-11">
                        {isOpen ? (
                            <div className="flex items-center gap-6 px-6 animate-in fade-in duration-500">
                                <Skeleton className="h-2 w-16 bg-white/10"/>
                                <Skeleton className="h-2 w-20 bg-white/5"/>
                                <Skeleton className="h-2 w-12 bg-white/10"/>
                            </div>
                        ) : (
                            <div className="flex items-center animate-in fade-in zoom-in-95 duration-300">
                                {navLinks.map((link) => (
                                    <a key={link.label} href={resolveLink(link.href)}>
                                        <Button
                                            variant="ghost"
                                            className="px-5 rounded-xl h-9 text-[10px] font-bold tracking-[0.2em] uppercase text-zinc-400 hover:bg-achieve-blue hover:text-white transition-all duration-300"
                                        >
                                            {link.label}
                                        </Button>
                                    </a>
                                ))}
                            </div>
                        )}
                    </nav>
                </div>

                <div className="flex items-center gap-4">
                    <Sheet open={isOpen} onOpenChange={setIsOpen}>
                        <SheetTrigger>
                            <Button
                                variant="ghost"
                                size="icon"
                                className={`
                                    relative text-white rounded-full w-12 h-12 transition-all duration-300
                                    ${isOpen ? 'opacity-0 scale-50' : 'opacity-100 scale-100'}
                                    hover:text-achieve-blue hover:bg-achieve-blue/10 hover:shadow-[0_0_20px_rgba(59,67,193,0.3)]
                                `}
                            >
                                <Menu className="h-6 w-6"/>
                                <span className="sr-only">Toggle navigation menu</span>
                            </Button>
                        </SheetTrigger>

                        <SheetContent
                            side="right"
                            className="
                                fixed right-0 inset-y-0.75 z-100
                                w-[calc(100%-1rem)] sm:w-105 h-auto
                                bg-black/85 backdrop-blur-3xl
                                rounded-l-2xl rounded-r-none
                                border-l border-y border-white/10
                                shadow-[0_0_50px_rgba(0,0,0,0.5)]
                                flex flex-col p-0 overflow-hidden
                                duration-200
                            "
                        >
                            <div
                                className="p-8 border-b border-white/10 bg-white/2 shrink-0 flex items-center justify-between">
                                <img src={achieveLogo.src} className="h-8 w-auto" alt="Achieve Fitness Logo"/>
                                <div className="w-8"/>
                            </div>

                            <nav className="flex-1 overflow-y-auto px-8 py-6 flex flex-col gap-1 scrollbar-none">
                                {navLinks.map((link, i) => (
                                    <a
                                        key={link.label}
                                        href={resolveLink(link.href)}
                                        onClick={() => setIsOpen(false)}
                                        className="text-xl font-black tracking-tight hover:tracking-normal transition-all duration-300 py-5 border-b border-white/3 flex justify-between items-center group shrink-0"
                                    >
                                        <span
                                            className="opacity-40 group-hover:opacity-100 group-hover:text-achieve-blue">
                                            {link.label}
                                        </span>
                                    </a>
                                ))}
                            </nav>

                            <div
                                className="mt-auto p-8 space-y-8 bg-linear-to-t from-black via-black/40 to-transparent shrink-0">
                                <div className="flex justify-center">
                                    <SocialLinks links={SOCIAL_LINKS} className="flex gap-10 items-center"/>
                                </div>
                                <Button
                                    className="w-full bg-achieve-blue text-white h-14 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] transition-all active:scale-95 shadow-[0_10px_30px_rgba(59,67,193,0.4)]"
                                >
                                    Start Transformation
                                </Button>
                            </div>
                        </SheetContent>
                    </Sheet>
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