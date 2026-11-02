import type {CSSProperties} from "react";

export interface ShimmerLayersProps {
    color?: string;
    duration?: string;
    edge?: string;
    background?: string;
}

export function ShimmerLayers({
    color = "rgba(255, 255, 255, 0.95)",
    duration = "3s",
    edge = "0.08em",
    background = "var(--achieve-blue-cta)",
}: ShimmerLayersProps) {
    const style = {
        "--spread": "90deg",
        "--shimmer-color": color,
        "--speed": duration,
        "--cut": edge,
        "--bg": background,
    } as CSSProperties;

    return (
        <>
            <span aria-hidden="true" style={style} className="@container-[size] pointer-events-none absolute inset-0 -z-20 overflow-visible blur-[2px]">
                <span className="motion-safe:animate-shimmer-slide absolute inset-0 aspect-square h-[100cqh]">
                    <span className="motion-safe:animate-spin-around absolute -inset-full w-auto [translate:0_0] rotate-0 [background:conic-gradient(from_calc(270deg-(var(--spread)*0.5)),transparent_0,var(--shimmer-color)_var(--spread),transparent_var(--spread))]"/>
                </span>
            </span>
            <span aria-hidden="true" style={style} className="pointer-events-none absolute inset-(--cut) -z-10 rounded-[inherit] [background:var(--bg)]"/>
            <span aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0_-8px_10px_#ffffff1f] transition-shadow duration-300 group-hover:shadow-[inset_0_-6px_10px_#ffffff3f] group-active:shadow-[inset_0_-10px_10px_#ffffff3f]"/>
        </>
    );
}
