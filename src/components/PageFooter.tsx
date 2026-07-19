// src/components/PageFooter.tsx
import SocialLinks from './SocialLinks';
import {SOCIAL_LINKS} from "@/constants/socials.ts";
import {Phone} from "lucide-react";

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="mt-auto w-full border-t border-white/2">
            <div className="bg-linear-to-t from-black via-[#050507] to-transparent pt-16 pb-6 px-6 md:px-12">
                <div className="flex flex-col md:flex-row justify-between items-center gap-y-10 max-w-7xl mx-auto">

                    {/* Copyright and Company Name */}
                    <div className="order-2 md:order-1">
                        <p className="text-[10px] tracking-[0.4em] uppercase text-zinc-500">
                            <span className="text-achieve-blue/70 font-bold">
                                Achieve Coaching &copy; {currentYear}
                            </span>

                        </p>
                    </div>

                    {/* Social & Contact Section */}
                    <div className="order-1 md:order-2 flex flex-col items-center md:items-end gap-6">
                        <div className="flex items-center gap-3 group cursor-default">
                            {/*Lucide SVG*/}
                            <Phone className="w-4 h-4 text-achieve-blue/80 transition-transform group-hover:scale-110"/>
                            <span
                                className="text-[11px] font-bold tracking-[0.3em] uppercase text-zinc-500 group-hover:text-zinc-300 transition-colors">
                                Get In Touch
                            </span>
                        </div>

                        {/*SOCIAL Buttons Component loading from socials.ts */}
                        <div className="flex items-center">
                            <SocialLinks links={SOCIAL_LINKS} className="flex gap-8"/>
                        </div>

                    </div>
                </div>
            </div>
        </footer>
    );
}