import {z} from "zod";
import {normalizePhone} from "./phone";
import {parseSocialProfile} from "./social";

export const FIELD_LIMITS = {
    name: 80,
    social: 120,
    phone: 24,
    email: 254,
    botcheck: 200,
} as const;

export const VALIDATION_MESSAGES = {
    nameRequired: "Please enter your name.",
    nameTooLong: `Keep your name under ${FIELD_LIMITS.name} characters.`,
    nameCharacters: "Use letters, spaces, apostrophes, full stops or hyphens.",
    social: "Enter an Instagram handle like @yourname or a LinkedIn profile link.",
    phone: "Enter a valid WhatsApp number, including the country code.",
    email: "Enter a valid email address, like you@example.com.",
} as const;

const NAME_PATTERN = /^\p{L}[\p{L}\p{M}' .-]*$/u;

export const applicationSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, VALIDATION_MESSAGES.nameRequired)
        .max(FIELD_LIMITS.name, VALIDATION_MESSAGES.nameTooLong)
        .regex(NAME_PATTERN, VALIDATION_MESSAGES.nameCharacters),
    social: z
        .string()
        .trim()
        .max(FIELD_LIMITS.social, VALIDATION_MESSAGES.social)
        .refine((value) => value === "" || parseSocialProfile(value) !== null, VALIDATION_MESSAGES.social),
    phone: z
        .string()
        .trim()
        .max(FIELD_LIMITS.phone, VALIDATION_MESSAGES.phone)
        .refine((value) => normalizePhone(value) !== null, VALIDATION_MESSAGES.phone),
    email: z
        .string()
        .trim()
        .max(FIELD_LIMITS.email, VALIDATION_MESSAGES.email)
        .pipe(z.email(VALIDATION_MESSAGES.email)),
});

export const submissionSchema = applicationSchema.extend({
    botcheck: z.string().max(FIELD_LIMITS.botcheck).optional(),
    elapsedMs: z.number().int().nonnegative().optional(),
});

export type ApplicationField = keyof z.input<typeof applicationSchema>;
export type ApplicationInput = z.input<typeof applicationSchema>;
export type Application = z.output<typeof applicationSchema>;
export type ApplicationSubmission = z.input<typeof submissionSchema>;
