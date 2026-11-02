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
    transformations: "transformations",
    qualification: "for-you",
    process: "process",
    apply: "apply",
    contact: "contact",
} as const;

export const FOOTER_LINKS = [
    {label: "Apply now", href: `#${SECTION_IDS.apply}`},
    {label: "Transformations", href: `#${SECTION_IDS.transformations}`},
    {label: "How it works", href: `#${SECTION_IDS.process}`},
    {label: "Contact us", href: `#${SECTION_IDS.contact}`},
] as const;

export const PRIMARY_CTA = {
    headerLabel: "Book Free Call",
    href: `#${SECTION_IDS.apply}`,
} as const;
