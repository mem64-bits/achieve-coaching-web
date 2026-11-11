import {cn} from "@/lib/utils";

export type BrandLoaderState = "loading" | "idle";

export interface BrandLoaderProps {
    state?: BrandLoaderState;
    label?: string;
    className?: string;
}

const A_MARK_PATH = "M393.767,0l394.792,788.542l-159.6,0l-235.208,-495.608l-234.15,495.608l-159.6,0l393.767,-788.542Z";
const DOT_COUNT = 30;
const ARC_DOTS = 10;
const ARC_PATTERN = [...Array.from({length: ARC_DOTS - 1}, () => "0 1"), `0 ${DOT_COUNT - ARC_DOTS + 1}`].join(" ");

export function BrandLoader({state = "loading", label, className}: BrandLoaderProps) {
    const loading = state === "loading";

    return (
        <span
            role={label ? "status" : undefined}
            aria-label={label}
            aria-hidden={label ? undefined : true}
            className={cn("brand-loader inline-block size-16 shrink-0", loading ? "brand-loader--loading" : "brand-loader--idle", className)}
        >
            <svg viewBox="0 0 100 100" className="block size-full overflow-visible" focusable="false" aria-hidden="true">
                <circle
                    className="brand-loader__track"
                    cx="50"
                    cy="50"
                    r="46"
                    fill="none"
                    strokeWidth="3"
                    strokeLinecap="round"
                    pathLength={DOT_COUNT}
                    strokeDasharray="0 1"
                />
                <circle
                    className="brand-loader__ring"
                    cx="50"
                    cy="50"
                    r="46"
                    fill="none"
                    strokeWidth="3"
                    strokeLinecap="round"
                    pathLength={DOT_COUNT}
                    strokeDasharray={loading ? ARC_PATTERN : "0 1"}
                />
                <circle className="brand-loader__disc" cx="50" cy="50" r="35" strokeWidth="1.5"/>
                <path className="brand-loader__mark" transform="translate(33 33) scale(0.04312)" d={A_MARK_PATH}/>
            </svg>
        </span>
    );
}
