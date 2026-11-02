export type SocialPlatform = "instagram" | "linkedin";

export interface SocialProfile {
    platform: SocialPlatform;
    handle: string;
    url: string;
}

const INSTAGRAM_HANDLE = /^[A-Za-z0-9._]{1,30}$/;
const INSTAGRAM_URL = /^(?:https?:\/\/)?(?:www\.)?instagram\.com\/([A-Za-z0-9._]{1,30})\/?(?:[?#].*)?$/i;
const LINKEDIN_SLUG = /^[A-Za-z0-9-]{3,100}$/;
const LINKEDIN_URL = /^(?:https?:\/\/)?(?:[a-z]{2,3}\.)?linkedin\.com\/in\/([A-Za-z0-9-]{3,100})\/?(?:[?#].*)?$/i;

const PLATFORM_LABELS: Record<SocialPlatform, string> = {
    instagram: "Instagram",
    linkedin: "LinkedIn",
};

function instagramProfile(handle: string): SocialProfile {
    return {platform: "instagram", handle, url: `https://instagram.com/${handle}`};
}

function linkedInProfile(handle: string): SocialProfile {
    return {platform: "linkedin", handle, url: `https://www.linkedin.com/in/${handle}`};
}

export function parseSocialProfile(input: string): SocialProfile | null {
    const value = input.trim();
    if (!value) {
        return null;
    }

    const instagramUrl = INSTAGRAM_URL.exec(value);
    if (instagramUrl) {
        return instagramProfile(instagramUrl[1]);
    }

    const linkedInUrl = LINKEDIN_URL.exec(value);
    if (linkedInUrl) {
        return linkedInProfile(linkedInUrl[1]);
    }

    const bareHandle = value.replace(/^@/, "");
    if (INSTAGRAM_HANDLE.test(bareHandle)) {
        return instagramProfile(bareHandle);
    }

    if (!value.startsWith("@") && bareHandle.includes("-") && LINKEDIN_SLUG.test(bareHandle)) {
        return linkedInProfile(bareHandle);
    }

    return null;
}

export function socialPlatformLabel(platform: SocialPlatform): string {
    return PLATFORM_LABELS[platform];
}
