// src/components/home/Primitives.tsx
import React from "react";
import {cn} from "@/lib/utils";
import {getImageUrl, type StepItem} from "../../constants/homeData";

/** 1. Primary CTA Button (.btn) */
interface ButtonProps {
    href?: string;
    type?: "button" | "submit" | "reset";
    children: React.ReactNode;
    className?: string;
    disabled?: boolean;
}

export function AchieveBtn({href, type = "button", children, className}: ButtonProps) {
    if (href) {
        return (
            <a href={href} className={cn("btn", className)}>
                {children}
            </a>
        );
    }
    return (
        <button type={type} className={cn("btn", className)}>
            {children}
        </button>
    );
}

/** 2. Section Heading (.lab + h2) */
interface SectionTitleProps {
    label?: string;
    titleStart: string;
    titleAccent?: string;
    className?: string;
}

export function SectionTitle({label, titleStart, titleAccent, className}: SectionTitleProps) {
    return (
        <div className={cn("mb-6", className)}>
            {label && <div className="lab">{label}</div>}
            <h2 className="achieve-h2">
                {titleStart} {titleAccent && <span className="a">{titleAccent}</span>}
            </h2>
        </div>
    );
}

/** 3. Auto-Resolved Image from src/assets/images/ */
export function AchieveImage({
                                 filename,
                                 alt = "Achieve Coaching client",
                                 eager = false,
                                 className,
                             }: {
    filename: string;
    alt?: string;
    eager?: boolean;
    className?: string;
}) {
    const src = getImageUrl(filename);
    return (
        <img
            src={src}
            alt={alt}
            loading={eager ? "eager" : "lazy"}
            className={cn("block w-full h-auto rounded-[8px]", className)}
        />
    );
}

// src/components/home/Primitives.tsx (Updated QuoteCard & StepRow)

/** 4. Client Testimonial Card (.quote & .quote.long) */
export function QuoteCard({
                              quote,
                              author,
                              isLong = false,
                          }: {
    quote: string;
    author: string;
    isLong?: boolean;
}) {
    return (
        <div className={cn("quote", isLong && "long")}>
            <p className="text-foreground">{quote}</p>
            <p className="a text-[16px]! mt-4!">{author}</p>
        </div>
    );
}

/** 5. Numbered Process Step Row (.step) */
export function StepRow({stepNumber, title, description}: StepItem) {
    return (
        <div className="step">
            <b>{stepNumber}</b>
            <div>
                <h3>{title}</h3>
                <p>{description}</p>
            </div>
        </div>
    );
}