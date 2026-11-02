import type {ImageMetadata} from "astro";
import type {ResultKind} from "@/types/results";
import image3 from "@images/image-3.jpg";
import image4 from "@images/image-4.png";
import image5 from "@images/image-5.jpg";
import image6 from "@images/image-6.jpg";
import image7 from "@images/image-7.png";
import image8 from "@images/image-8.jpg";
import image9 from "@images/image-9.png";
import image10 from "@images/image-10.jpg";
import image11 from "@images/image-11.jpg";
import image12 from "@images/image-12.jpg";
import image13 from "@images/image-13.jpg";
import image14 from "@images/image-14.jpg";
import image15 from "@images/image-15.png";
import image16 from "@images/image-16.jpg";
import image17 from "@images/image-17.jpg";
import image18 from "@images/image-18.jpg";
import image19 from "@images/image-19.jpg";
import image20 from "@images/image-20.jpg";
import image21 from "@images/image-21.jpg";
import image22 from "@images/image-22.jpg";
import image23 from "@images/image-23.jpg";
import image24 from "@images/image-24.png";
import image25 from "@images/image-25.jpg";

export interface ResultPhoto {
    image: ImageMetadata;
    alt: string;
    kind: ResultKind;
}

export const RESULT_PHOTOS: ResultPhoto[] = [
    {image: image3, kind: "transformation", alt: "Client before and after coaching, front view"},
    {image: image16, kind: "transformation", alt: "Client before and after coaching, front view in the gym"},
    {image: image4, kind: "transformation", alt: "Client before and after coaching, showing major fat loss"},
    {image: image20, kind: "transformation", alt: "Client before and after coaching, front view"},
    {image: image22, kind: "transformation", alt: "Client before and after coaching, back view"},
    {image: image11, kind: "transformation", alt: "Client before and after coaching, front view"},
    {image: image9, kind: "transformation", alt: "Client progress in three mirror photos"},
    {image: image19, kind: "transformation", alt: "Client before and after coaching, mirror photo"},
    {image: image23, kind: "transformation", alt: "Client before and after coaching, side view"},
    {image: image8, kind: "transformation", alt: "Client before and after coaching, front view"},
    {image: image21, kind: "transformation", alt: "Client before and after coaching, mirror photo"},
    {image: image10, kind: "transformation", alt: "Client before and after coaching, front view outdoors"},
    {image: image18, kind: "transformation", alt: "Client before and after coaching, side view then mirror photo"},
    {image: image25, kind: "moment", alt: "Client posing on stage at a physique competition"},
    {image: image5, kind: "moment", alt: "Client hitting a back double biceps pose outdoors"},
    {image: image7, kind: "moment", alt: "Client smiling in training gear"},
    {image: image12, kind: "moment", alt: "Client flexing outdoors on a patio"},
    {image: image13, kind: "moment", alt: "Client training on a cable machine"},
    {image: image15, kind: "moment", alt: "Client training with a dumbbell in the gym"},
    {image: image17, kind: "moment", alt: "Two clients posing backstage at a physique competition"},
    {image: image14, kind: "moment", alt: "Client standing in the sea on holiday"},
    {image: image6, kind: "moment", alt: "Clients celebrating with their awards after a competition"},
    {image: image24, kind: "moment", alt: "Group of clients holding a plank on the grass"},
];
