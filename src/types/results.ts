import type {ResponsiveImage} from "./images";

export type ResultKind = "transformation" | "moment";

export interface GalleryPhoto {
    id: string;
    kind: ResultKind;
    aspectRatio: number;
    // Show whole in its card instead of zoomed to fill (see ResultPhoto).
    showWhole: boolean;
    thumb: ResponsiveImage;
    full: ResponsiveImage;
}
