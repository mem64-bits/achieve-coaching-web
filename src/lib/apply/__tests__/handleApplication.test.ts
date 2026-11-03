import {describe, expect, it, vi} from "vitest";
import {handleApplicationRequest, MAX_BODY_BYTES, RESPONSE_MESSAGES} from "../handleApplication";
import type {ApplicationNotifier} from "../notifier";
import type {NotificationEmail} from "../notificationEmail";

const validBody = {
    name: "Alex Murphy",
    social: "@alex",
    phone: "+353871234567",
    email: "alex@example.com",
    botcheck: "",
    elapsedMs: 15000,
};

function makeRequest(body: unknown, contentType = "application/json"): Request {
    return new Request("https://www.achieve-coaching.net/api/apply", {
        method: "POST",
        headers: {"Content-Type": contentType},
        body: typeof body === "string" ? body : JSON.stringify(body),
    });
}

function recordingNotifier() {
    const sent: Array<{email: NotificationEmail; replyTo: string}> = [];
    const notifier: ApplicationNotifier = {
        async send(email, replyTo) {
            sent.push({email, replyTo});
        },
    };
    return {notifier, sent};
}

const silentLog = () => {};

describe("handleApplicationRequest", () => {
    it("sends one notification for a valid application", async () => {
        const {notifier, sent} = recordingNotifier();
        const response = await handleApplicationRequest(makeRequest(validBody), {notifier, logError: silentLog});

        expect(response.status).toBe(200);
        expect(await response.json()).toEqual({success: true});
        expect(sent).toHaveLength(1);
        expect(sent[0].replyTo).toBe("alex@example.com");
        expect(sent[0].email.subject).toContain("Alex Murphy");
    });

    it("still accepts an application from a cached older form that sends a goal", async () => {
        const {notifier, sent} = recordingNotifier();
        const response = await handleApplicationRequest(makeRequest({...validBody, goal: "lose-fat"}), {notifier, logError: silentLog});

        expect(response.status).toBe(200);
        expect(sent).toHaveLength(1);
        expect(sent[0].email.text).not.toMatch(/goal/i);
    });

    it("refuses requests that are not JSON, which also blocks cross-site form posts", async () => {
        const {notifier, sent} = recordingNotifier();
        const response = await handleApplicationRequest(
            makeRequest("name=Alex", "application/x-www-form-urlencoded"),
            {notifier, logError: silentLog},
        );

        expect(response.status).toBe(415);
        expect(sent).toHaveLength(0);
    });

    it("refuses oversized bodies", async () => {
        const {notifier, sent} = recordingNotifier();
        const huge = {...validBody, name: "a".repeat(MAX_BODY_BYTES)};
        const response = await handleApplicationRequest(makeRequest(huge), {notifier, logError: silentLog});

        expect(response.status).toBe(413);
        expect(sent).toHaveLength(0);
    });

    it("returns 400 for broken JSON", async () => {
        const {notifier} = recordingNotifier();
        const response = await handleApplicationRequest(makeRequest("{not json"), {notifier, logError: silentLog});

        expect(response.status).toBe(400);
        expect((await response.json()).error).toBe(RESPONSE_MESSAGES.invalidJson);
    });

    it("returns field errors the form can show next to each input", async () => {
        const {notifier, sent} = recordingNotifier();
        const response = await handleApplicationRequest(
            makeRequest({...validBody, email: "not-an-email", phone: "123"}),
            {notifier, logError: silentLog},
        );
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(Object.keys(data.fieldErrors).sort()).toEqual(["email", "phone"]);
        expect(sent).toHaveLength(0);
    });

    it("pretends to succeed for bots without sending anything", async () => {
        const {notifier, sent} = recordingNotifier();
        const honeypot = await handleApplicationRequest(
            makeRequest({...validBody, botcheck: "https://spam.example"}),
            {notifier, logError: silentLog},
        );
        const tooFast = await handleApplicationRequest(
            makeRequest({...validBody, elapsedMs: 300}),
            {notifier, logError: silentLog},
        );

        expect(honeypot.status).toBe(200);
        expect(tooFast.status).toBe(200);
        expect(sent).toHaveLength(0);
    });

    it("hides provider errors from the visitor and logs them instead", async () => {
        const logError = vi.fn();
        const failing: ApplicationNotifier = {
            async send() {
                throw new Error("Resend rejected the email: validation_error");
            },
        };
        const response = await handleApplicationRequest(makeRequest(validBody), {notifier: failing, logError});
        const data = await response.json();

        expect(response.status).toBe(502);
        expect(data.error).toBe(RESPONSE_MESSAGES.failed);
        expect(JSON.stringify(data)).not.toContain("validation_error");
        expect(logError).toHaveBeenCalledOnce();
    });

    it("reports when email sending is not configured", async () => {
        const logError = vi.fn();
        const response = await handleApplicationRequest(makeRequest(validBody), {notifier: null, logError});

        expect(response.status).toBe(503);
        expect(logError).toHaveBeenCalledOnce();
    });
});
