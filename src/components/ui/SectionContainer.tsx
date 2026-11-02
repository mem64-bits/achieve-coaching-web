import React, {forwardRef} from 'react';
import {cn} from '@/lib/utils.ts';

export type ContainerMaxWidthPreset = 'default' | 'narrow' | 'wide' | 'full';
export type ContainerSpacingPreset = 'normal' | 'relaxed' | 'compact' | 'none';

/**
 * ADT Dimension: Accepts either predefined design-system tokens or explicit CSS/numeric dimensions (e.g., 800, '90vw', '120px').
 */
export type ContainerMaxWidth = ContainerMaxWidthPreset | number | string;
export type ContainerSpacing = ContainerSpacingPreset | number | string;

export interface SectionContainerBaseProps {
    id?: string;
    className?: string;
    maxWidth?: ContainerMaxWidth;
    spacing?: ContainerSpacing;
    paddingTop?: ContainerSpacing;
    animationVariant?: 'fade' | 'slide' | 'none';
    style?: React.CSSProperties;
    children?: React.ReactNode;
}

export type SectionContainerProps<E extends React.ElementType = 'section'> =
    SectionContainerBaseProps & {
    as?: E;
} & Omit<React.ComponentPropsWithRef<E>, keyof SectionContainerBaseProps | 'as'>;

const maxWidthMap: Record<ContainerMaxWidthPreset, string> = {
    default: 'max-w-[1100px]',
    narrow: 'max-w-[720px]',
    wide: 'max-w-[1280px]',
    full: 'max-w-full',
};

const spacingMap: Record<ContainerSpacingPreset, string> = {
    normal: 'pb-[72px]',
    relaxed: 'pb-[120px] sm:pb-[160px]',
    compact: 'pb-[40px]',
    none: 'pb-0',
};

const paddingTopMap: Record<ContainerSpacingPreset, string> = {
    normal: 'pt-[72px]',
    relaxed: 'pt-[120px] sm:pt-[160px]',
    compact: 'pt-[40px]',
    none: 'pt-0',
};

function formatDimension(val: number | string): string {
    return typeof val === 'number' ? `${val}px` : val;
}

/**
 * SectionContainer (Box Wrapper ADT)
 *
 * A polymorphic layout container with support for:
 * - Semantic layout tokens & explicit arbitrary sizes
 * - Forwarded refs for GSAP/ScrollTrigger/DOM measurement
 * - Polymorphic `as` prop (e.g. `section`, `div`, `motion.div`, etc.)
 */
export const SectionContainer = forwardRef(function SectionContainer<
    E extends React.ElementType = 'section'
>(
    {
        id,
        className,
        maxWidth = 'default',
        spacing = 'normal',
        paddingTop,
        animationVariant = 'none',
        as,
        style,
        children,
        ...rest
    }: SectionContainerProps<E>,
    ref: React.Ref<any>
) {
    const Component = as || 'section';

    const isMaxWidthPreset = typeof maxWidth === 'string' && maxWidth in maxWidthMap;
    const isSpacingPreset = typeof spacing === 'string' && spacing in spacingMap;
    const isPaddingTopPreset = typeof paddingTop === 'string' && paddingTop in paddingTopMap;

    const dynamicStyle: React.CSSProperties = {
        ...(!isMaxWidthPreset && maxWidth !== undefined ? {maxWidth: formatDimension(maxWidth)} : {}),
        ...(!isSpacingPreset && spacing !== undefined ? {paddingBottom: formatDimension(spacing)} : {}),
        ...(!isPaddingTopPreset && paddingTop !== undefined ? {paddingTop: formatDimension(paddingTop)} : {}),
        ...style,
    };

    return (
        <Component
            ref={ref}
            id={id}
            style={Object.keys(dynamicStyle).length > 0 ? dynamicStyle : undefined}
            className={cn(
                'mx-auto w-full px-4 sm:px-6',
                isMaxWidthPreset && maxWidthMap[maxWidth as ContainerMaxWidthPreset],
                isSpacingPreset && spacingMap[spacing as ContainerSpacingPreset],
                isPaddingTopPreset && paddingTopMap[paddingTop as ContainerSpacingPreset],
                animationVariant === 'fade' && 'transition-opacity duration-300',
                animationVariant === 'slide' && 'transition-transform duration-300',
                className
            )}
            {...rest}
        >
            {children}
        </Component>
    );
}) as <E extends React.ElementType = 'section'>(
    props: SectionContainerProps<E> & { ref?: React.Ref<any> }
) => React.ReactElement | null;
