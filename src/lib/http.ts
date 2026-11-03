export function jsonResponse(status: number, body: unknown, headers: HeadersInit = {}): Response {
    return new Response(JSON.stringify(body), {
        status,
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Cache-Control": "no-store",
            ...headers,
        },
    });
}

export function isJsonRequest(request: Request): boolean {
    const contentType = request.headers.get("content-type") ?? "";
    return contentType.split(";")[0].trim().toLowerCase() === "application/json";
}

export type BodyReadResult =
    | {ok: true; text: string}
    | {ok: false; reason: "too-large" | "unreadable"};

export async function readBodyWithLimit(request: Request, maxBytes: number): Promise<BodyReadResult> {
    const declaredLength = Number(request.headers.get("content-length"));
    if (Number.isFinite(declaredLength) && declaredLength > maxBytes) {
        return {ok: false, reason: "too-large"};
    }

    let text: string;
    try {
        text = await request.text();
    } catch {
        return {ok: false, reason: "unreadable"};
    }

    if (new TextEncoder().encode(text).byteLength > maxBytes) {
        return {ok: false, reason: "too-large"};
    }

    return {ok: true, text};
}
