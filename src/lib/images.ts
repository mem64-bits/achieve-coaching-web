import path from "node:path";
import {getImage} from "astro:assets";
import type {ImageMetadata} from "astro";
import sharp from "sharp";
import type {ImageSource, ResponsiveImage} from "@/types/images";

export interface ResponsiveImageOptions {
    widths: number[];
    sizes: string;
    alt: string;
    quality?: {avif: number; webp: number};
    placeholder?: boolean;
}

const DEFAULT_QUALITY = {avif: 55, webp: 72};
const PLACEHOLDER_WIDTH = 16;

const sourceFiles = import.meta.glob<{default: ImageMetadata}>("/src/assets/images/*.{jpg,jpeg,png,webp}", {
    eager: true,
});

const filePathByImage = new Map<ImageMetadata, string>(
    Object.entries(sourceFiles).map(([projectPath, module]) => [module.default, projectPath]),
);

const placeholderCache = new Map<ImageMetadata, Promise<string | undefined>>();

function usableWidths(image: ImageMetadata, widths: number[]): number[] {
    const fitting = widths.filter((width) => width <= image.width);
    return fitting.length > 0 ? fitting : [image.width];
}

async function createPlaceholder(image: ImageMetadata): Promise<string | undefined> {
    const projectPath = filePathByImage.get(image);
    if (!projectPath) {
        return undefined;
    }

    const buffer = await sharp(path.join(process.cwd(), projectPath))
        .rotate()
        .resize(PLACEHOLDER_WIDTH)
        .blur(1)
        .webp({quality: 40})
        .toBuffer();

    return `data:image/webp;base64,${buffer.toString("base64")}`;
}

export function placeholderFor(image: ImageMetadata): Promise<string | undefined> {
    if (!placeholderCache.has(image)) {
        placeholderCache.set(image, createPlaceholder(image).catch(() => undefined));
    }
    return placeholderCache.get(image)!;
}

async function sourceFor(
    image: ImageMetadata,
    format: "avif" | "webp",
    widths: number[],
    height: number,
    sizes: string,
    quality: number,
) {
    return getImage({
        src: image,
        width: Math.max(...widths),
        height,
        widths,
        sizes,
        format,
        quality,
    });
}

export async function toResponsiveImage(image: ImageMetadata, options: ResponsiveImageOptions): Promise<ResponsiveImage> {
    const widths = usableWidths(image, options.widths);
    const largest = Math.max(...widths);
    const height = Math.round((largest / image.width) * image.height);
    const quality = options.quality ?? DEFAULT_QUALITY;

    const [avif, webp, placeholder] = await Promise.all([
        sourceFor(image, "avif", widths, height, options.sizes, quality.avif),
        sourceFor(image, "webp", widths, height, options.sizes, quality.webp),
        options.placeholder ? placeholderFor(image) : Promise.resolve(undefined),
    ]);

    const sources: ImageSource[] = [
        {type: "image/avif", srcSet: avif.srcSet.attribute},
        {type: "image/webp", srcSet: webp.srcSet.attribute},
    ];

    return {
        src: webp.src,
        srcSet: webp.srcSet.attribute,
        sizes: options.sizes,
        width: largest,
        height,
        alt: options.alt,
        sources,
        placeholder,
    };
}
