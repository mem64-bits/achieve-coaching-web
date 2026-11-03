import {SECTION_IDS} from "./site";

export const APPLY_FORM_COPY = {
    sectionId: SECTION_IDS.apply,
    eyebrow: "Free consultation call",
    titleStart: "Apply for",
    titleAccent: "coaching",
    intro: "Four quick details, then we take it from there.",
    formTitle: "Tell us about you",
    formDescription: "We'll message you on WhatsApp to book your free call.",
    trustPoints: ["Free call", "Under a minute", "Reply within 24 hours"],
    fields: {
        name: {label: "Full name", placeholder: "Alex Murphy"},
        social: {
            label: "Instagram or LinkedIn",
            hint: "@yourname or linkedin.com/in/yourname",
            placeholder: "@yourname",
        },
        phone: {label: "WhatsApp number", hint: "Tap the flag to search countries or codes, like 35 or Ireland.", placeholder: "87 123 4567"},
        email: {label: "Email", placeholder: "you@example.com"},
    },
    actions: {
        submit: "Send application",
        submitting: "Sending...",
        submittingStatus: "Sending your application",
    },
    countryPicker: {
        title: "Choose your country code",
        searchLabel: "Search countries or dial codes",
        placeholder: "Country or code, e.g. 35",
        hint: "Type digits to match dial codes, or letters to match country names.",
        listLabel: "Countries",
        close: "Close country list",
        triggerLabel: (country: string, dialCode: string) => `Country code: ${country}, +${dialCode}. Change country`,
        empty: (query: string) => `No country matches "${query}".`,
    },
    success: {
        title: "Application received!",
        body: "Thanks for reaching out! We will review your application and send you a WhatsApp message within 24 hours.",
        reset: "Submit another response",
    },
    errors: {
        generic: "Something went wrong sending your application. Please try again, or message us on WhatsApp.",
        network: "We couldn't reach the server. Check your connection and try again.",
    },
};
