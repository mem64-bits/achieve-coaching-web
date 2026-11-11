import {useEffect, useRef, useState, type CSSProperties, type ImgHTMLAttributes} from "react";
import type {ResponsiveImage} from "@/types/images";
import {cn} from "@/lib/utils";
import {BrandLoader} from "./BrandLoader";

export interface ResponsivePictureProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "srcSet" | "sizes" | "width" | "height" | "alt"> {
    image: ResponsiveImage;
    showPlaceholder?: boolean;
}

function hasFailed(img: HTMLImageElement | null): boolean {
    return Boolean(img && img.complete && img.naturalWidth === 0);
}

export function ResponsivePicture({
    image,
    showPlaceholder = true,
    style,
    className,
    loading = "lazy",
    decoding = "async",
    onError,
    ...imgProps
}: ResponsivePictureProps) {
    const imgRef = useRef<HTMLImageElement>(null);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        if (hasFailed(imgRef.current)) {
            setFailed(true);
        }
    }, []);

    const placeholderStyle: CSSProperties | undefined =
        showPlaceholder && image.placeholder
            ? {backgroundImage: `url("${image.placeholder}")`, backgroundSize: "cover", backgroundPosition: "center"}
            : undefined;

    if (failed) {
        return (
            <span
                role="img"
                aria-label={image.alt}
                style={{aspectRatio: `${image.width} / ${image.height}`, ...placeholderStyle, ...style}}
                className={cn("relative bg-card", className)}
            >
                <span className="absolute inset-0 grid place-items-center bg-card/70">
                    <BrandLoader state="idle" className="size-14"/>
                </span>
            </span>
        );
    }

    return (
        <picture>
            {image.sources.map((source) => (
                <source key={source.type} type={source.type} srcSet={source.srcSet} sizes={image.sizes}/>
            ))}
            <img
                ref={imgRef}
                src={image.src}
                srcSet={image.srcSet}
                sizes={image.sizes}
                width={image.width}
                height={image.height}
                alt={image.alt}
                loading={loading}
                decoding={decoding}
                style={{...placeholderStyle, ...style}}
                className={className}
                onError={(event) => {
                    setFailed(true);
                    onError?.(event);
                }}
                {...imgProps}
            />
        </picture>
    );
}
