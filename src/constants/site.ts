export const SITE = {
    name: "Achieve Coaching",
    url: "https://www.achieve-coaching.net",
    defaultTitle: "Achieve Coaching | Online coaching that fits your life",
    description:
        "Online coaching for busy people who want visible results and still want to eat out, travel and enjoy their weekends.",
    foundedYear: 2021,
    locale: "en_IE",
    themeColor: "#000000",
} as const;

export const SECTION_IDS = {
    results: "results",
    qualification: "for-you",
    process: "process",
    apply: "apply",
} as const;

export const PRIMARY_CTA = {
    headerLabel: "Book Free Call",
    href: `#${SECTION_IDS.apply}`,
} as const;
