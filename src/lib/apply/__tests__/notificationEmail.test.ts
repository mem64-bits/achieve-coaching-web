import {describe, expect, it} from "vitest";
import {escapeHtml} from "@/lib/html";
import {buildNotificationEmail} from "../notificationEmail";
import type {Application} from "../schema";

const application: Application = {
    name: "Seán O'Brien",
    social: "linkedin.com/in/sean-obrien",
    phone: "+353 87 123 4567",
    email: "sean@example.com",
};

describe("escapeHtml", () => {
    it("escapes every character that can break out of HTML", () => {
        expect(escapeHtml(`<a href="x">'&'</a>`)).toBe("&lt;a href=&quot;x&quot;&gt;&#39;&amp;&#39;&lt;/a&gt;");
    });
});

describe("buildNotificationEmail", () => {
    it("includes every detail in both the HTML and plain-text versions", () => {
        const email = buildNotificationEmail(application);

        expect(email.subject).toBe("New Achieve Coaching client: Seán O'Brien");
        expect(email.html).toContain("wants to <span style=\"color: #3D7BFF;\">start coaching.</span>");
        expect(email.html).toContain("Seán O&#39;Brien");
        expect(email.html).toContain("https://wa.me/353871234567");
        expect(email.html).toContain("https://www.linkedin.com/in/sean-obrien");
        expect(email.text).toContain("LinkedIn: https://www.linkedin.com/in/sean-obrien");
        expect(email.text).toContain("WhatsApp: +353 87 123 4567");
    });

    it("never places raw user input into the HTML", () => {
        const email = buildNotificationEmail({...application, email: `a"onmouseover="x@example.com`});

        expect(email.html).not.toContain(`"onmouseover="`);
        expect(email.html).toContain("&quot;onmouseover=&quot;");
    });

    it("no longer mentions goals, which the form stopped asking for", () => {
        const email = buildNotificationEmail(application);

        expect(email.html).not.toMatch(/goal/i);
        expect(email.text).not.toMatch(/goal/i);
    });

    it("stamps the time the application arrived in Irish time", () => {
        const email = buildNotificationEmail(application, {receivedAt: new Date("2026-07-01T12:30:00Z")});

        expect(email.text).toContain("Received: 1 Jul 2026, 13:30");
    });

    it("says when no social profile was given", () => {
        const email = buildNotificationEmail({...application, social: ""});

        expect(email.text).toContain("Social: None provided");
    });
});
