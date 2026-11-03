export interface CountryOption {
    iso2: string;
    name: string;
    dialCode: string;
}

function normaliseText(value: string): string {
    return value
        .normalize("NFD")
        .replace(/\p{M}/gu, "")
        .toLowerCase()
        .trim();
}

function dialCodeQuery(query: string): string | null {
    const compact = query.replace(/[\s()-]/g, "");
    const match = /^\+?(\d+)$/.exec(compact);
    return match ? match[1] : null;
}

function byDialCodeThenName(a: CountryOption, b: CountryOption): number {
    return a.dialCode.length - b.dialCode.length || a.dialCode.localeCompare(b.dialCode) || a.name.localeCompare(b.name);
}

export function searchCountries(query: string, countries: CountryOption[]): CountryOption[] {
    const trimmed = query.trim();
    if (!trimmed) {
        return countries;
    }

    const digits = dialCodeQuery(trimmed);
    if (digits) {
        return countries.filter((country) => country.dialCode.startsWith(digits)).sort(byDialCodeThenName);
    }

    const text = normaliseText(trimmed);
    const startsWith: CountryOption[] = [];
    const contains: CountryOption[] = [];

    for (const country of countries) {
        const name = normaliseText(country.name);
        if (name.startsWith(text) || country.iso2 === text) {
            startsWith.push(country);
        } else if (name.includes(text)) {
            contains.push(country);
        }
    }

    return [...startsWith, ...contains];
}
