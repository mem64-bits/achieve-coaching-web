import {Quote} from "lucide-react";
import {ShineBorder} from "@/components/effects/ShineBorder";
import type {Testimonial} from "@constants/results";
import {cn} from "@/lib/utils";

export interface QuoteCardProps extends Testimonial {
    align?: "start" | "center";
    className?: string;
}

export function QuoteCard({quote, name, age, align = "center", className}: QuoteCardProps) {
    return (
        <figure
            className={cn(
                "relative flex h-full flex-col rounded-2xl border border-white/10 bg-elevated p-6 sm:p-7",
                align === "center" && "items-center text-center",
                className,
            )}
        >
            <ShineBorder duration={18}/>
            <Quote aria-hidden="true" className="size-8 shrink-0 text-achieve-blue/70"/>
            <blockquote className="mt-4 grow text-[1.0625rem] leading-relaxed font-semibold text-foreground">
                <p>{quote}</p>
            </blockquote>
            <figcaption className="eyebrow mt-6">
                {name}
                {age !== undefined && <span className="text-muted-foreground">, {age}</span>}
            </figcaption>
        </figure>
    );
}
