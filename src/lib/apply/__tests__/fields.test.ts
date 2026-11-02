import {describe, expect, it} from "vitest";
import {normalizePhone, whatsAppLink} from "../phone";
import {parseSocialProfile} from "../social";
import {applicationSchema, VALIDATION_MESSAGES} from "../schema";

const validApplication = {
    goal: "lose-fat",
    name: "Alex Murphy",
    social: "@alex.murphy",
    phone: "+353 87 123 4567",
    email: "alex@example.com",
};

describe("normalizePhone", () => {
    it("accepts international numbers and keeps only digits for WhatsApp", () => {
        expect(normalizePhone("+353 87 123 4567")).toEqual({digits: "353871234567", display: "+353 87 123 4567"});
        expect(normalizePhone("+1 (555) 123-4567")?.digits).toBe("15551234567");
        expect(normalizePhone("+353871234567")?.digits).toBe("353871234567");
    });

    it("rejects numbers that are too short, too long or contain letters", () => {
        expect(normalizePhone("12345")).toBeNull();
        expect(normalizePhone("")).toBeNull();
        expect(normalizePhone("+353")).toBeNull();
        expect(normalizePhone("+1234567890123456")).toBeNull();
        expect(normalizePhone("+353 87 CALL ME")).toBeNull();
    });

    it("builds a wa.me link from the digits", () => {
        const phone = normalizePhone("+353 87 123 4567");
        expect(phone && whatsAppLink(phone)).toBe("https://wa.me/353871234567");
    });
});

describe("parseSocialProfile", () => {
    it("reads Instagram handles and profile links", () => {
        expect(parseSocialProfile("@bobbyok_")).toEqual({
            platform: "instagram",
            handle: "bobbyok_",
            url: "https://instagram.com/bobbyok_",
        });
        expect(parseSocialProfile("https://instagram.com/bobbyok_/?igshid=abc")?.handle).toBe("bobbyok_");
        expect(parseSocialProfile("www.instagram.com/some.user")?.handle).toBe("some.user");
    });

    it("reads LinkedIn profile links and slugs", () => {
        expect(parseSocialProfile("https://www.linkedin.com/in/bobby-okodogbe-0b33b51a5")).toEqual({
            platform: "linkedin",
            handle: "bobby-okodogbe-0b33b51a5",
            url: "https://www.linkedin.com/in/bobby-okodogbe-0b33b51a5",
        });
        expect(parseSocialProfile("ie.linkedin.com/in/jane-doe/")?.platform).toBe("linkedin");
        expect(parseSocialProfile("jane-doe-123")?.platform).toBe("linkedin");
    });

    it("rejects anything that is not a recognisable profile", () => {
        expect(parseSocialProfile("invalid user name!")).toBeNull();
        expect(parseSocialProfile("https://evil.example.com/@user")).toBeNull();
        expect(parseSocialProfile("javascript:alert(1)")).toBeNull();
        expect(parseSocialProfile("")).toBeNull();
    });
});

describe("applicationSchema", () => {
    it("accepts a complete application and trims whitespace", () => {
        const result = applicationSchema.safeParse({...validApplication, name: "  Alex Murphy  ", email: " alex@example.com "});
        expect(result.success).toBe(true);
        expect(result.data?.name).toBe("Alex Murphy");
        expect(result.data?.email).toBe("alex@example.com");
    });

    it("treats the social field as optional", () => {
        expect(applicationSchema.safeParse({...validApplication, social: ""}).success).toBe(true);
    });

    it("accepts names with accents, apostrophes and hyphens", () => {
        for (const name of ["Seán O'Brien", "Zoë Smith-Jones", "Y.Rey", "José"]) {
            expect(applicationSchema.safeParse({...validApplication, name}).success).toBe(true);
        }
    });

    it("rejects names containing markup or line breaks", () => {
        expect(applicationSchema.safeParse({...validApplication, name: "<script>alert(1)</script>"}).success).toBe(false);
        expect(applicationSchema.safeParse({...validApplication, name: "Alex\nBcc: someone"}).success).toBe(false);
    });

    it("returns a friendly message for each invalid field", () => {
        const result = applicationSchema.safeParse({goal: "nope", name: "", social: "!!", phone: "12", email: "x@y"});
        const messages = result.error?.issues.map((issue) => issue.message) ?? [];
        expect(messages).toContain(VALIDATION_MESSAGES.goal);
        expect(messages).toContain(VALIDATION_MESSAGES.nameRequired);
        expect(messages).toContain(VALIDATION_MESSAGES.social);
        expect(messages).toContain(VALIDATION_MESSAGES.phone);
        expect(messages).toContain(VALIDATION_MESSAGES.email);
    });

    it("rejects malformed email addresses", () => {
        for (const email of ["plainstring", "missing@domain", "@missinguser.com", ""]) {
            expect(applicationSchema.safeParse({...validApplication, email}).success).toBe(false);
        }
        expect(applicationSchema.safeParse({...validApplication, email: "user.name+tag@sub.domain.co.uk"}).success).toBe(true);
    });
});
