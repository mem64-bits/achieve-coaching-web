import type {ReactNode} from "react";
import {cva, type VariantProps} from "class-variance-authority";
import {ShimmerLayers} from "@/components/effects/ShimmerLayers";
import {cn} from "@/lib/utils";

export const achieveButtonVariants = cva(
    "group relative isolate z-0 inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-[0.625rem] font-display font-extrabold uppercase tracking-[0.04em] no-underline transition-[box-shadow,background-color,border-color,color,transform] duration-200 active:translate-y-px disabled:pointer-events-none disabled:opacity-60 aria-disabled:pointer-events-none aria-disabled:opacity-60",
    {
        variants: {
            variant: {
                primary:
                    "bg-achieve-cta text-white shadow-[inset_0_0_0_1px_var(--hairline-light),0_10px_30px_-14px_var(--achieve-blue-glow)] hover:shadow-[inset_0_0_0_1px_var(--hairline-light-strong),0_0_28px_-6px_var(--achieve-blue-glow)]",
                outline:
                    "border border-white/15 bg-white/[0.02] text-foreground hover:border-achieve-blue/70 hover:bg-achieve-soft",
                ghost: "bg-transparent text-muted-foreground hover:text-foreground",
            },
            size: {
                sm: "min-h-11 px-3.5 text-[0.8125rem]",
                md: "min-h-12 px-6 text-[0.9375rem]",
                lg: "min-h-14 px-8 text-base",
            },
            fullWidth: {
                true: "w-full",
                false: "",
            },
        },
        defaultVariants: {
            variant: "primary",
            size: "md",
            fullWidth: false,
        },
    },
);

type ButtonVariantProps = VariantProps<typeof achieveButtonVariants>;

interface SharedProps extends ButtonVariantProps {
    children: ReactNode;
    className?: string;
    effect?: "none" | "shimmer" | "beam";
}

interface LinkButtonProps extends SharedProps {
    href: string;
    type?: never;
    disabled?: never;
    onClick?: never;
}

interface NativeButtonProps extends SharedProps {
    href?: undefined;
    type?: "button" | "submit" | "reset";
    disabled?: boolean;
    onClick?: () => void;
}

export type AchieveBtnProps = LinkButtonProps | NativeButtonProps;

export function AchieveBtn({
    children,
    className,
    effect = "none",
    variant,
    size,
    fullWidth,
    ...rest
}: AchieveBtnProps) {
    const classes = cn(achieveButtonVariants({variant, size, fullWidth}), effect !== "none" && "overflow-hidden", className);
    const content = (
        <>
            {effect === "shimmer" && <ShimmerLayers/>}
            {/* A short run of light around the edge; styles in effects.css. */}
            {effect === "beam" && <span aria-hidden="true" className="border-beam"/>}
            {children}
        </>
    );

    if (rest.href !== undefined) {
        return (
            <a href={rest.href} className={classes}>
                {content}
            </a>
        );
    }

    return (
        <button type={rest.type ?? "button"} disabled={rest.disabled} onClick={rest.onClick} className={classes}>
            {content}
        </button>
    );
}
