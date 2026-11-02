import type { ApplyRequestPayload, ApplyResponseData } from '../types/apply';

export async function submitApplication(payload: ApplyRequestPayload): Promise<ApplyResponseData> {
    const response = await fetch('/api/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Failed to submit application.');
    }

    return data;
}
