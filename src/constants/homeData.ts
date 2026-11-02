import heroImage from "@images/image-2.jpg";
import {PRIMARY_CTA, SECTION_IDS} from "./site";

export const HERO_CONTENT = {
    eyebrow: "Online fitness coaching",
    titlePrefix: "Get lean",
    titleHighlight: "without giving up",
    titleSuffix: "your social life.",
    subtitle:
        "Online coaching for busy people who need visible results, still want to eat out, travel and enjoy their weekends.",
    ctaLabel: "Apply now",
    ctaHref: PRIMARY_CTA.href,
    secondaryLabel: "See client results",
    secondaryHref: `#${SECTION_IDS.results}`,
    image: heroImage,
    imageAlt: "Coach smiling on an outdoor sports court, holding a tennis racket",
};

export interface StepItem {
    stepNumber: string;
    title: string;
    description: string;
}

export const HOW_IT_WORKS = {
    titleStart: "How it",
    titleAccent: "works",
    steps: [
        {
            stepNumber: "1",
            title: "Fill Out the Contact Form",
            description: "Complete our short form to get started.",
        },
        {
            stepNumber: "2",
            title: "Book Your Free Call",
            description: "We'll send you a link to book your complimentary call and discuss the next steps.",
        },
        {
            stepNumber: "3",
            title: "Start Your Coaching",
            description:
                "Get personalised training, tailored nutrition and ongoing accountability designed to deliver lasting results without compromising your lifestyle.",
        },
    ] satisfies StepItem[],
};

export const QUALIFICATION = {
    titleStart: "This is for you",
    titleAccent: "if",
    points: [
        "You want to get lean and keep your social life.",
        "You want to become more confident and build discipline.",
        "You're ready to commit to coaching, not a quick fix.",
    ],
    ctaLabel: "Sounds like me",
    ctaHref: PRIMARY_CTA.href,
};
