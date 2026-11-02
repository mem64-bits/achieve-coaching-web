// src/constants/homeData.ts

// Automatically load all extracted images from src/assets/images/
const imageModules = import.meta.glob<{ default: { src: string } | string }>(
    "/src/assets/images/*.{png,jpg,jpeg,webp,svg}",
    {eager: true}
);

export function getImageUrl(filename: string): string {
    const key = `/src/assets/images/${filename}`;
    const mod = imageModules[key];
    if (!mod) {
        console.warn(`[Achieve] Image not found in src/assets/images/: ${filename}`);
        return "";
    }
    return typeof mod.default === "string" ? mod.default : mod.default.src;
}

export type MosaicEntry =
    | { type: "image"; filename: string; alt?: string }
    | { type: "quote"; quote: string; author: string; isLong?: boolean };

export const HERO_CONTENT = {
    titlePrefix: "Get lean",
    titleHighlight: "without giving up",
    titleSuffix: " your social life.",
    subtitle:
        "Online coaching for busy people who need visible results, still want to eat out, travel and enjoy their weekends.",
    ctaLabel: "APPLY NOW",
    ctaHref: "#apply",
    imageFilename: "image-2.jpg",
    imageAlt: "Coach",
};

export const MOSAIC_COLUMNS: MosaicEntry[][] = [
    // Column 1 (image-3 to image-11)
    [
        {type: "image", filename: "image-3.jpg"},
        {type: "image", filename: "image-4.png"},
        {type: "image", filename: "image-5.jpg"},
        {type: "image", filename: "image-6.jpg"},
        {type: "image", filename: "image-7.png"},
        {type: "image", filename: "image-8.jpg"},
        {type: "image", filename: "image-9.png"},
        {type: "image", filename: "image-10.jpg"},
        {type: "image", filename: "image-11.jpg"},
    ],
    // Column 2 (image-12 to 14, Sofya quote, image-15 to 18)
    [
        {type: "image", filename: "image-12.jpg"},
        {type: "image", filename: "image-13.jpg"},
        {type: "image", filename: "image-14.jpg"},
        {
            type: "quote",
            isLong: true,
            quote: "“I could clearly feel I was stronger, more energetic and fitter overall. Highly recommend if you want to fall in love with the gym 🙂”",
            author: "— Sofya T. 29",
        },
        {type: "image", filename: "image-15.png"},
        {type: "image", filename: "image-16.jpg"},
        {type: "image", filename: "image-17.jpg"},
        {type: "image", filename: "image-18.jpg"},
    ],
    // Column 3 (image-19, Maneesh quote, image-20 to 23, Client 30 quote, image-24 to 25)
    [
        {type: "image", filename: "image-19.jpg"},
        {
            type: "quote",
            isLong: false,
            quote: "“I’ve seen more progress in these 4 months than I did over the last ten years on my own.”",
            author: "— Maneesh 36",
        },
        {type: "image", filename: "image-20.jpg"},
        {type: "image", filename: "image-21.jpg"},
        {type: "image", filename: "image-22.jpg"},
        {type: "image", filename: "image-23.jpg"},
        {
            type: "quote",
            isLong: true,
            quote: "“After not seeing much progress for a while, Bobby helped me see improvements again. He created a new training program and diet tailored to my schedule. he’s always great at motivating me to push harder. Over the 3 months , I significantly reduced my body fat and increased muscle. ”",
            author: "— Y.Rey 43",
        },
        {type: "image", filename: "image-24.png"},
        {type: "image", filename: "image-25.jpg"},
    ],
];

export interface StepItem {
    stepNumber: string;
    title: string;
    description: string;
}

export const HOW_IT_WORKS_STEPS: StepItem[] = [
    {
        stepNumber: "1",
        title: "Fill Out the Contact Form",
        description:
            "Complete our short form to get started.",
    },
    {
        stepNumber: "2",
        title: "Book Your Free Call",
        description:
            "We'll send you a link to book your complimentary call and discuss the next steps.",
    },
    {
        stepNumber: "3",
        title: "Start Your Coaching",
        description:
            "Get personalised training, tailored nutrition and ongoing accountability designed to deliver lasting results without compromising your lifestyle.",
    },
];

export const FOR_YOU_IF_LIST: string[] = [
    "You want to get lean and keep your social life.",
    "You want to become more confident and build discipline.",
    "You're ready to commit to coaching, not a quick fix.",
];