import type {ResponsiveImage} from "./images";

export type ResultKind = "transformation" | "moment";

export interface GalleryPhoto {
    id: string;
    kind: ResultKind;
    thumb: ResponsiveImage;
    full: ResponsiveImage;
}
