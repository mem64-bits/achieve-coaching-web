import React from 'react';
import { cn } from '../../lib/utils';

export interface SectionContainerProps {
    id?: string;
    className?: string;
    maxWidth?: 'default' | 'narrow' | 'wide' | 'full';
    spacing?: 'normal' | 'relaxed' | 'compact' | 'none';
    animationVariant?: 'fade' | 'slide' | 'none';
    as?: 'section' | 'div';
    children: React.ReactNode;
}

const maxWidthMap = {
    default: 'max-w-[1100px]',
    narrow: 'max-w-[720px]',
    wide: 'max-w-[1280px]',
    full: 'max-w-full',
};

const spacingMap = {
    normal: 'pb-[72px]',
    relaxed: 'pb-[120px] sm:pb-[160px]',
    compact: 'pb-[40px]',
    none: 'pb-0',
};

export function SectionContainer({
    id,
    className,
    maxWidth = 'default',
    spacing = 'normal',
    animationVariant = 'none',
    as: Component = 'section',
    children,
}: SectionContainerProps) {
    return (
        <Component
            id={id}
            className={cn(
                'mx-auto w-full px-6',
                maxWidthMap[maxWidth],
                spacingMap[spacing],
                animationVariant === 'fade' && 'transition-opacity duration-300',
                animationVariant === 'slide' && 'transition-transform duration-300',
                className
            )}
        >
            {children}
        </Component>
    );
}
