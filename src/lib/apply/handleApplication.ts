import {z} from "zod";
import {isJsonRequest, jsonResponse, readBodyWithLimit} from "@/lib/http";
import type {ApplyResponseData} from "@/types/apply";
import {buildNotificationEmail} from "./notificationEmail";
import type {ApplicationNotifier} from "./notifier";
import {submissionSchema, type ApplicationField} from "./schema";

export const MAX_BODY_BYTES = 8 * 1024;
export const MIN_HUMAN_FILL_MS = 2500;

export const RESPONSE_MESSAGES = {
    unsupportedType: "Send the application as JSON.",
    tooLarge: "That request is too large.",
    invalidJson: "We couldn't read that request.",
    invalidFields: "Please check the highlighted fields.",
    unavailable: "Applications are temporarily unavailable. Please message us on WhatsApp instead.",
    failed: "We couldn't send your application. Please try again, or message us on WhatsApp.",
} as const;

export interface ApplicationHandlerDeps {
    notifier: ApplicationNotifier | null;
    logError?: (message: string, detail?: unknown) => void;
}

function respond(status: number, body: ApplyResponseData): Response {
    return jsonResponse(status, body);
}

function firstMessages(fieldErrors: Record<string, string[] | undefined>): Partial<Record<ApplicationField, string>> {
    const result: Partial<Record<ApplicationField, string>> = {};
    for (const [field, messages] of Object.entries(fieldErrors)) {
        if (messages?.length) {
            result[field as ApplicationField] = messages[0];
        }
    }
    return result;
}

function looksAutomated(botcheck: string | undefined, elapsedMs: number | undefined): boolean {
    const filledHoneypot = Boolean(botcheck?.trim());
    const tooFast = elapsedMs !== undefined && elapsedMs < MIN_HUMAN_FILL_MS;
    return filledHoneypot || tooFast;
}

export async function handleApplicationRequest(request: Request, deps: ApplicationHandlerDeps): Promise<Response> {
    const logError = deps.logError ?? ((message, detail) => console.error(message, detail));

    if (!isJsonRequest(request)) {
        return respond(415, {error: RESPONSE_MESSAGES.unsupportedType});
    }

    const body = await readBodyWithLimit(request, MAX_BODY_BYTES);
    if (!body.ok) {
        return body.reason === "too-large"
            ? respond(413, {error: RESPONSE_MESSAGES.tooLarge})
            : respond(400, {error: RESPONSE_MESSAGES.invalidJson});
    }

    let payload: unknown;
    try {
        payload = JSON.parse(body.text);
    } catch {
        return respond(400, {error: RESPONSE_MESSAGES.invalidJson});
    }

    const parsed = submissionSchema.safeParse(payload);
    if (!parsed.success) {
        const {fieldErrors} = z.flattenError(parsed.error);
        return respond(400, {error: RESPONSE_MESSAGES.invalidFields, fieldErrors: firstMessages(fieldErrors)});
    }

    const {botcheck, elapsedMs, ...application} = parsed.data;
    if (looksAutomated(botcheck, elapsedMs)) {
        return respond(200, {success: true});
    }

    if (!deps.notifier) {
        logError("[apply] No email notifier configured. Set RESEND_API_KEY.");
        return respond(503, {error: RESPONSE_MESSAGES.unavailable});
    }

    try {
        await deps.notifier.send(buildNotificationEmail(application), application.email);
    } catch (error) {
        logError("[apply] Sending the notification failed.", error instanceof Error ? error.message : error);
        return respond(502, {error: RESPONSE_MESSAGES.failed});
    }

    return respond(200, {success: true});
}
