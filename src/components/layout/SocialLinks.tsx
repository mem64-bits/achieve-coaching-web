import {cn} from "@/lib/utils";

export interface SocialLink {
    label: string;
    icon: string;
    href: string;
}

interface SocialLinksProps {
    links: SocialLink[];
    className?: string;
}

function SocialIcon({label, icon, href}: SocialLink) {
    const mask = `url("${icon}") center / contain no-repeat`;

    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${label} (opens in a new tab)`}
            className="group relative grid size-12 place-items-center rounded-full"
        >
            <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-1 rounded-full bg-achieve-blue/25 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100"
            />
            <span
                aria-hidden="true"
                style={{mask, WebkitMask: mask}}
                className="relative size-6 bg-white/85 transition-[transform,background-color] duration-300 ease-out group-hover:-translate-y-0.5 group-hover:scale-110 group-hover:bg-achieve-blue"
            />
        </a>
    );
}

export function SocialLinks({links, className}: SocialLinksProps) {
    return (
        <ul className={cn("flex items-center gap-4", className)}>
            {links.map((link) => (
                <li key={link.label}>
                    <SocialIcon {...link}/>
                </li>
            ))}
        </ul>
    );
}
