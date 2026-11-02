import React from "react";
import {cn} from "@/lib/utils";

export interface SectionTitleProps {
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
