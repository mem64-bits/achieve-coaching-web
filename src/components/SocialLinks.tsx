// src/components/SocialLinks.tsx
import React from 'react';

interface SocialLink {
    label: string;
    icon: string;
    href: string;
}

const SocialIcon = ({label, icon, href}: SocialLink) => {
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            /* We keep the anchor size fixed */
            className="group relative flex items-center justify-center w-5 h-5"
            aria-label={`Follow Achieve Coaching on ${label}`}
        >
            {/*DETECTION BOX (Hitbox) */}
            {/* The inset-6 creates the large clickable area without moving the icon */}
            <span className="absolute -inset-6 z-30 cursor-pointer"/>

            <div
                style={{
                    WebkitMaskImage: `url("${icon}")`,
                    maskImage: `url("${icon}")`,
                    WebkitMaskRepeat: 'no-repeat',
                    maskRepeat: 'no-repeat',
                    WebkitMaskPosition: 'center',
                    maskPosition: 'center',
                    WebkitMaskSize: 'contain',
                    maskSize: 'contain'
                }}
                className="
                    /* Force explicit size here so it doesn't disappear */
                    w-5 h-5 z-10
                    transition-all duration-300 ease-out

                    /* ANIMATION: Triggered by group-hover on the parent <a> */
                    group-hover:scale-125 group-hover:-translate-y-1
                    bg-muted-foreground/40 group-hover:bg-achieve-blue
                "
            />

            {/*GLOW EFFECT*/}
            <div className="
                absolute inset-0 -m-8
                bg-achieve-blue/25 blur-2xl rounded-full
                opacity-0 group-hover:opacity-100
                scale-50 group-hover:scale-100
                transition-all duration-500 ease-in-out
                pointer-events-none
            "/>
        </a>
    );
};

export default function SocialLinks({links, className = "flex gap-10"}: { links: any[], className?: string }) {
    return (
        <ul className={className}>
            {links.map((link) => (
                <li key={link.label} className="flex items-center justify-center">
                    <SocialIcon {...link} />
                </li>
            ))}
        </ul>
    );
}