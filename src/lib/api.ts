import {APPLY_FORM_COPY} from "@/constants/applyForm";
import type {ApplicationSubmission, ApplyResponseData} from "@/types/apply";

export const APPLY_ENDPOINT = "/api/apply";

export class ApplicationSubmitError extends Error {
    constructor(
        message: string,
        readonly fieldErrors: ApplyResponseData["fieldErrors"] = {},
    ) {
        super(message);
        this.name = "ApplicationSubmitError";
    }
}

async function readResponse(response: Response): Promise<ApplyResponseData> {
    try {
        return (await response.json()) as ApplyResponseData;
    } catch {
        return {};
    }
}

export async function submitApplication(payload: ApplicationSubmission): Promise<void> {
    let response: Response;
    try {
        response = await fetch(APPLY_ENDPOINT, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(payload),
        });
    } catch {
        throw new ApplicationSubmitError(APPLY_FORM_COPY.errors.network);
    }

    const data = await readResponse(response);
    if (!response.ok || !data.success) {
        throw new ApplicationSubmitError(data.error ?? APPLY_FORM_COPY.errors.generic, data.fieldErrors);
    }
}
