export const SITE = {
    name: "Achieve Coaching",
    alternateName: "achieve-coaching.net",
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
    reviews: "reviews",
    transformations: "transformations",
    qualification: "for-you",
    process: "process",
    apply: "apply",
    contact: "contact",
} as const;

export const HEADER_LINKS = [
    {label: "Transformations", shortLabel: "Results", href: `#${SECTION_IDS.results}`},
    {label: "Reviews", shortLabel: "Reviews", href: `#${SECTION_IDS.reviews}`},
    {label: "Contact us", shortLabel: "Contact", href: `#${SECTION_IDS.contact}`},
] as const;

export const PRIMARY_CTA = {
    headerLabel: "Book Free Call",
    href: `#${SECTION_IDS.apply}`,
} as const;
