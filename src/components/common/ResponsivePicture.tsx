import type {CSSProperties, ImgHTMLAttributes} from "react";
import type {ResponsiveImage} from "@/types/images";

export interface ResponsivePictureProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "srcSet" | "sizes" | "width" | "height" | "alt"> {
    image: ResponsiveImage;
    showPlaceholder?: boolean;
}

export function ResponsivePicture({image, showPlaceholder = true, style, loading = "lazy", decoding = "async", ...imgProps}: ResponsivePictureProps) {
    const placeholderStyle: CSSProperties | undefined =
        showPlaceholder && image.placeholder
            ? {backgroundImage: `url("${image.placeholder}")`, backgroundSize: "cover", backgroundPosition: "center"}
            : undefined;

    return (
        <picture>
            {image.sources.map((source) => (
                <source key={source.type} type={source.type} srcSet={source.srcSet} sizes={image.sizes}/>
            ))}
            <img
                src={image.src}
                srcSet={image.srcSet}
                sizes={image.sizes}
                width={image.width}
                height={image.height}
                alt={image.alt}
                loading={loading}
                decoding={decoding}
                style={{...placeholderStyle, ...style}}
                {...imgProps}
            />
        </picture>
    );
}
