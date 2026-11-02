import {GOAL_OPTIONS} from "@/constants/applyForm";
import {SITE} from "@/constants/site";
import {escapeHtml} from "@/lib/html";
import {normalizePhone, whatsAppLink} from "./phone";
import type {Application} from "./schema";
import {parseSocialProfile, socialPlatformLabel} from "./social";

export interface NotificationEmail {
    subject: string;
    html: string;
    text: string;
}

interface DetailRow {
    label: string;
    text: string;
    html: string;
}

const EMAIL_COLORS = {
    background: "#0A0A0B",
    border: "#373A3F",
    divider: "#1A1B1D",
    muted: "#8B93A1",
    text: "#FFFFFF",
    accent: "#3D7BFF",
    whatsapp: "#25D366",
} as const;

function link(href: string, label: string): string {
    return `<a href="${escapeHtml(href)}" style="color: ${EMAIL_COLORS.accent}; text-decoration: none;">${escapeHtml(label)}</a>`;
}

function buildRows(application: Application): DetailRow[] {
    const phone = normalizePhone(application.phone);
    const social = parseSocialProfile(application.social);
    const goal = GOAL_OPTIONS[application.goal];
    const goalText = `${goal.label} (${goal.description})`;

    return [
        {label: "Name", text: application.name, html: escapeHtml(application.name)},
        {label: "Goal", text: goalText, html: escapeHtml(goalText)},
        {
            label: "Email",
            text: application.email,
            html: link(`mailto:${application.email}`, application.email),
        },
        {
            label: "WhatsApp",
            text: phone?.display ?? application.phone,
            html: escapeHtml(phone?.display ?? application.phone),
        },
        social
            ? {
                label: socialPlatformLabel(social.platform),
                text: social.url,
                html: link(social.url, `${social.platform === "instagram" ? "@" : ""}${social.handle}`),
            }
            : {label: "Social", text: "None provided", html: `<span style="color: ${EMAIL_COLORS.muted};">None provided</span>`},
    ];
}

function renderHtml(rows: DetailRow[], whatsAppUrl: string | null): string {
    const tableRows = rows
        .map(
            (row) => `
                <tr>
                    <td style="padding: 10px 0; color: ${EMAIL_COLORS.muted}; width: 140px; border-bottom: 1px solid ${EMAIL_COLORS.divider};">${escapeHtml(row.label)}</td>
                    <td style="padding: 10px 0; color: ${EMAIL_COLORS.text}; font-weight: bold; border-bottom: 1px solid ${EMAIL_COLORS.divider};">${row.html}</td>
                </tr>`,
        )
        .join("");

    const whatsAppButton = whatsAppUrl
        ? `
            <div style="margin-top: 28px; text-align: center;">
                <a href="${escapeHtml(whatsAppUrl)}" style="display: inline-block; background: ${EMAIL_COLORS.whatsapp}; color: ${EMAIL_COLORS.text}; font-weight: bold; text-decoration: none; padding: 14px 28px; border-radius: 6px; font-size: 15px;">
                    Chat with client on WhatsApp
                </a>
            </div>`
        : "";

    return `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid ${EMAIL_COLORS.border}; border-radius: 8px; background: ${EMAIL_COLORS.background}; color: ${EMAIL_COLORS.text};">
            <h2 style="color: ${EMAIL_COLORS.accent}; text-transform: uppercase; margin-top: 0; font-size: 22px;">New ${escapeHtml(SITE.name)} application</h2>
            <p style="font-size: 15px; color: ${EMAIL_COLORS.muted}; margin-bottom: 20px;">A prospective client just submitted an application on your website:</p>
            <table style="width: 100%; border-collapse: collapse; font-size: 15px;">${tableRows}
            </table>${whatsAppButton}
        </div>`;
}

function renderText(rows: DetailRow[], whatsAppUrl: string | null): string {
    const lines = rows.map((row) => `${row.label}: ${row.text}`);
    if (whatsAppUrl) {
        lines.push("", `Chat on WhatsApp: ${whatsAppUrl}`);
    }
    return [`New ${SITE.name} application`, "", ...lines].join("\n");
}

export function buildNotificationEmail(application: Application): NotificationEmail {
    const rows = buildRows(application);
    const phone = normalizePhone(application.phone);
    const whatsAppUrl = phone ? whatsAppLink(phone) : null;

    return {
        subject: `New ${SITE.name} client: ${application.name}`,
        html: renderHtml(rows, whatsAppUrl),
        text: renderText(rows, whatsAppUrl),
    };
}
