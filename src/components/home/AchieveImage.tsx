import React from "react";
import {cn} from "@/lib/utils";
import {getImageUrl} from "@/constants/homeData";

export interface AchieveImageProps {
    filename: string;
    alt?: string;
    eager?: boolean;
    className?: string;
}

export function AchieveImage({
                                 filename,
                                 alt = "Achieve Coaching client",
                                 eager = false,
                                 className,
                             }: AchieveImageProps) {
    return (
        <img
            src={getImageUrl(filename)}
            alt={alt}
            loading={eager ? "eager" : "lazy"}
            className={cn("block w-full h-auto rounded-[8px]", className)}
        />
    );
}
