import {SECTION_IDS} from "./site";

export const GOAL_IDS = ["lose-fat", "build-muscle", "recomposition", "fitness"] as const;

export type GoalId = (typeof GOAL_IDS)[number];

export interface GoalOption {
    label: string;
    description: string;
}

export const GOAL_OPTIONS: Record<GoalId, GoalOption> = {
    "lose-fat": {label: "Get lean", description: "Lose fat and see definition"},
    "build-muscle": {label: "Build muscle", description: "Add size and strength"},
    recomposition: {label: "Both", description: "Lose fat and build muscle together"},
    fitness: {label: "Feel fitter", description: "More energy, confidence and discipline"},
};

export const APPLY_STEP_IDS = ["goal", "about", "contact"] as const;

export type ApplyStepId = (typeof APPLY_STEP_IDS)[number];

export interface ApplyStepCopy {
    shortLabel: string;
    title: string;
    description: string;
}

export const APPLY_STEPS: Record<ApplyStepId, ApplyStepCopy> = {
    goal: {
        shortLabel: "Goal",
        title: "What's your main goal?",
        description: "Pick the one that matters most right now.",
    },
    about: {
        shortLabel: "About you",
        title: "Tell us about you",
        description: "So we know who we're talking to before the call.",
    },
    contact: {
        shortLabel: "Contact",
        title: "Where can we reach you?",
        description: "We'll message you on WhatsApp to book your free call.",
    },
};

export const APPLY_FORM_COPY = {
    sectionId: SECTION_IDS.apply,
    eyebrow: "Free consultation call",
    titleStart: "Apply for",
    titleAccent: "coaching",
    intro: "Three quick steps, then we take it from there.",
    trustPoints: ["Free call", "Under a minute", "Reply within 24 hours"],
    fields: {
        name: {label: "Full name", placeholder: "Alex Murphy"},
        social: {
            label: "Instagram or LinkedIn",
            optionalTag: "Optional",
            hint: "@yourname or linkedin.com/in/yourname",
            placeholder: "@yourname",
        },
        phone: {label: "WhatsApp number", hint: "Include your country code."},
        email: {label: "Email", placeholder: "you@example.com"},
    },
    actions: {
        next: "Continue",
        back: "Back",
        submit: "Send application",
        submitting: "Sending...",
    },
    progressLabel: (current: number, total: number) => `Step ${current} of ${total}`,
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
