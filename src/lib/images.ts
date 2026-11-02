import {getImage} from "astro:assets";
import type {ImageMetadata} from "astro";
import type {ResponsiveImage} from "@/types/images";

export interface ResponsiveImageOptions {
    widths: number[];
    sizes: string;
    alt: string;
    quality?: number;
    format?: "webp" | "avif" | "jpeg";
}

function usableWidths(image: ImageMetadata, widths: number[]): number[] {
    const fitting = widths.filter((width) => width <= image.width);
    return fitting.length > 0 ? fitting : [image.width];
}

export async function toResponsiveImage(image: ImageMetadata, options: ResponsiveImageOptions): Promise<ResponsiveImage> {
    const widths = usableWidths(image, options.widths);
    const largest = Math.max(...widths);
    const height = Math.round((largest / image.width) * image.height);

    const result = await getImage({
        src: image,
        width: largest,
        height,
        widths,
        sizes: options.sizes,
        format: options.format ?? "webp",
        quality: options.quality ?? 75,
    });

    return {
        src: result.src,
        srcSet: result.srcSet.attribute,
        sizes: options.sizes,
        width: largest,
        height,
        alt: options.alt,
    };
}
