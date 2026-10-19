import React from "react";
import {cn} from "@/lib/utils";

export interface QuoteCardProps {
    quote: string;
    author: string;
    isLong?: boolean;
}

export function QuoteCard({quote, author, isLong = false}: QuoteCardProps) {
    return (
        <div className={cn("quote", isLong && "long")}>
            <p className="text-foreground">{quote}</p>
            <p className="a text-[16px]! mt-4!">{author}</p>
        </div>
    );
}
