import React from "react";
import {cn} from "@/lib/utils";

export interface AchieveBtnProps {
    href?: string;
    type?: "button" | "submit" | "reset";
    children: React.ReactNode;
    className?: string;
    disabled?: boolean;
}

export function AchieveBtn({
                               href,
                               type = "button",
                               children,
                               className,
                               disabled = false,
                           }: AchieveBtnProps) {
    if (href) {
        return (
            <a href={href} className={cn("btn", className)} aria-disabled={disabled || undefined}>
                {children}
            </a>
        );
    }

    return (
        <button type={type} className={cn("btn", className)} disabled={disabled}>
            {children}
        </button>
    );
}
