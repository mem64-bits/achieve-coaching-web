import React, {forwardRef} from "react";
import {cn} from "@/lib/utils";

export type ContainerMaxWidthPreset = "default" | "narrow" | "wide" | "full";
export type ContainerSpacingPreset = "normal" | "relaxed" | "compact" | "none";
export type ContainerAnimation = "none" | "fade" | "slide";

export type ContainerMaxWidth = ContainerMaxWidthPreset | number | string;
export type ContainerSpacing = ContainerSpacingPreset | number | string;

export interface SectionContainerBaseProps {
    id?: string;
    className?: string;
    maxWidth?: ContainerMaxWidth;
    spacing?: ContainerSpacing;
    paddingTop?: ContainerSpacing;
    animationVariant?: ContainerAnimation;
    style?: React.CSSProperties;
    children?: React.ReactNode;
}

export type SectionContainerProps<E extends React.ElementType = "section"> =
    SectionContainerBaseProps & {
    as?: E;
} & Omit<React.ComponentPropsWithRef<E>, keyof SectionContainerBaseProps | "as">;

const maxWidthMap: Record<ContainerMaxWidthPreset, string> = {
    default: "max-w-[1100px]",
    narrow: "max-w-[720px]",
    wide: "max-w-[1280px]",
    full: "max-w-full",
};

const spacingMap: Record<ContainerSpacingPreset, string> = {
    normal: "pb-section",
    relaxed: "pb-[calc(var(--section-space)*1.25)]",
    compact: "pb-[calc(var(--section-space)*0.5)]",
    none: "pb-0",
};

const paddingTopMap: Record<ContainerSpacingPreset, string> = {
    normal: "pt-section",
    relaxed: "pt-[calc(var(--section-space)*1.25)]",
    compact: "pt-[calc(var(--section-space)*0.5)]",
    none: "pt-0",
};

const animationMap: Record<ContainerAnimation, string> = {
    none: "",
    fade: "reveal-fade",
    slide: "reveal-rise",
};

function formatDimension(value: number | string): string {
    return typeof value === "number" ? `${value}px` : value;
}

function isPreset<T extends string>(value: unknown, map: Record<T, string>): value is T {
    return typeof value === "string" && value in map;
}

export const SectionContainer = forwardRef(function SectionContainer<
    E extends React.ElementType = "section",
>(
    {
        id,
        className,
        maxWidth = "default",
        spacing = "normal",
        paddingTop,
        animationVariant = "none",
        as,
        style,
        children,
        ...rest
    }: SectionContainerProps<E>,
    ref: React.Ref<any>,
) {
    const Component = as || "section";

    const dynamicStyle: React.CSSProperties = {
        ...(!isPreset(maxWidth, maxWidthMap) ? {maxWidth: formatDimension(maxWidth)} : {}),
        ...(!isPreset(spacing, spacingMap) ? {paddingBottom: formatDimension(spacing)} : {}),
        ...(paddingTop !== undefined && !isPreset(paddingTop, paddingTopMap)
            ? {paddingTop: formatDimension(paddingTop)}
            : {}),
        ...style,
    };

    return (
        <Component
            ref={ref}
            id={id}
            style={Object.keys(dynamicStyle).length > 0 ? dynamicStyle : undefined}
            className={cn(
                "mx-auto w-full px-gutter",
                isPreset(maxWidth, maxWidthMap) && maxWidthMap[maxWidth],
                isPreset(spacing, spacingMap) && spacingMap[spacing],
                isPreset(paddingTop, paddingTopMap) && paddingTopMap[paddingTop],
                animationMap[animationVariant],
                className,
            )}
            {...rest}
        >
            {children}
        </Component>
    );
}) as <E extends React.ElementType = "section">(
    props: SectionContainerProps<E> & {ref?: React.Ref<any>},
) => React.ReactElement | null;
