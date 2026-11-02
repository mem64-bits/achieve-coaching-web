export interface NormalizedPhone {
    digits: string;
    display: string;
}

const ALLOWED_PHONE_CHARACTERS = /^\+?[\d\s().-]+$/;
const MIN_PHONE_DIGITS = 8;
const MAX_PHONE_DIGITS = 15;

export function normalizePhone(input: string): NormalizedPhone | null {
    const display = input.trim();
    if (!ALLOWED_PHONE_CHARACTERS.test(display)) {
        return null;
    }

    const digits = display.replace(/\D/g, "");
    if (digits.length < MIN_PHONE_DIGITS || digits.length > MAX_PHONE_DIGITS) {
        return null;
    }

    return {digits, display};
}

export function whatsAppLink(phone: NormalizedPhone): string {
    return `https://wa.me/${phone.digits}`;
}
