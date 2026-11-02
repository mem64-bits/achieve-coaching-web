export interface ImageSource {
    type: "image/avif" | "image/webp";
    srcSet: string;
}

export interface ResponsiveImage {
    src: string;
    srcSet: string;
    sizes: string;
    width: number;
    height: number;
    alt: string;
    sources: ImageSource[];
    placeholder?: string;
}
