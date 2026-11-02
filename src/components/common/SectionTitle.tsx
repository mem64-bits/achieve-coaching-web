import type {ReactNode} from "react";
import {cn} from "@/lib/utils";

export interface SectionTitleProps {
    eyebrow?: string;
    titleStart: string;
    titleAccent?: string;
    description?: ReactNode;
    align?: "start" | "center";
    as?: "h1" | "h2" | "h3";
    id?: string;
    className?: string;
}

export function SectionTitle({
    eyebrow,
    titleStart,
    titleAccent,
    description,
    align = "start",
    as: Heading = "h2",
    id,
    className,
}: SectionTitleProps) {
    return (
        <div className={cn("flex flex-col gap-3", align === "center" && "items-center text-center", className)}>
            {eyebrow && <p className="eyebrow">{eyebrow}</p>}
            <Heading id={id} className="font-display text-title font-extrabold uppercase text-balance text-foreground">
                {titleStart}
                {titleAccent && <span className="text-achieve-blue"> {titleAccent}</span>}
            </Heading>
            {description && <p className="max-w-[38rem] text-lead text-muted-foreground">{description}</p>}
        </div>
    );
}
