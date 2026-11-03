import {SITE} from "@/constants/site";
import {escapeHtml} from "@/lib/html";
import {normalizePhone, whatsAppLink} from "./phone";
import type {Application} from "./schema";
import {parseSocialProfile, socialPlatformLabel, type SocialProfile} from "./social";

export interface NotificationEmail {
    subject: string;
    html: string;
    text: string;
}

export interface NotificationEmailOptions {
    receivedAt?: Date;
    timeZone?: string;
}

interface DetailRow {
    label: string;
    text: string;
    html: string;
}

const EMAIL = {
    page: "#000000",
    card: "#0A0A0B",
    panel: "#141519",
    border: "#26282E",
    muted: "#8B93A1",
    text: "#FFFFFF",
    accent: "#3D7BFF",
    button: "#0B3FC4",
    whatsapp: "#25D366",
    fontBody: "Helvetica, Arial, sans-serif",
    fontDisplay: "'Arial Black', 'Helvetica Neue', Helvetica, Arial, sans-serif",
    logoPath: "/email/achieve-coaching-logo.png",
} as const;

function link(href: string, label: string): string {
    return `<a href="${escapeHtml(href)}" style="color: ${EMAIL.accent}; text-decoration: none;">${escapeHtml(label)}</a>`;
}

function formatReceived(date: Date, timeZone: string): string {
    return new Intl.DateTimeFormat("en-IE", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone,
    }).format(date);
}

function socialRow(social: SocialProfile | null): DetailRow {
    if (!social) {
        return {
            label: "Social",
            text: "None provided",
            html: `<span style="color: ${EMAIL.muted};">None provided</span>`,
        };
    }
    const shown = `${social.platform === "instagram" ? "@" : ""}${social.handle}`;
    return {label: socialPlatformLabel(social.platform), text: social.url, html: link(social.url, shown)};
}

function buildRows(application: Application, receivedAt: string): DetailRow[] {
    const phone = normalizePhone(application.phone);
    const phoneText = phone?.display ?? application.phone;

    return [
        {label: "Name", text: application.name, html: escapeHtml(application.name)},
        {label: "WhatsApp", text: phoneText, html: escapeHtml(phoneText)},
        {label: "Email", text: application.email, html: link(`mailto:${application.email}`, application.email)},
        socialRow(parseSocialProfile(application.social)),
        {label: "Received", text: receivedAt, html: escapeHtml(receivedAt)},
    ];
}

function renderDetailRows(rows: DetailRow[]): string {
    return rows
        .map(
            (row) => `
                <tr>
                    <td style="padding: 12px 0; width: 110px; color: ${EMAIL.muted}; font-size: 14px; border-bottom: 1px solid ${EMAIL.border}; vertical-align: top;">${escapeHtml(row.label)}</td>
                    <td style="padding: 12px 0; color: ${EMAIL.text}; font-size: 15px; font-weight: bold; border-bottom: 1px solid ${EMAIL.border}; word-break: break-word;">${row.html}</td>
                </tr>`,
        )
        .join("");
}

function button(href: string, label: string, background: string): string {
    return `
        <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 0 12px 0;">
            <tr>
                <td bgcolor="${background}" style="border-radius: 6px; background: ${background};">
                    <a href="${escapeHtml(href)}" style="display: inline-block; padding: 16px 28px; font-family: ${EMAIL.fontDisplay}; font-size: 15px; font-weight: 900; letter-spacing: 0.06em; text-transform: uppercase; color: #FFFFFF; text-decoration: none;">${escapeHtml(label)}</a>
                </td>
            </tr>
        </table>`;
}

function renderHtml(application: Application, rows: DetailRow[], whatsAppUrl: string | null, preheader: string): string {
    const firstName = application.name.split(" ")[0];
    const logoUrl = new URL(EMAIL.logoPath, SITE.url).href;
    const buttons = [
        whatsAppUrl ? button(whatsAppUrl, `Message ${firstName} on WhatsApp →`, EMAIL.button) : "",
        button(`mailto:${application.email}`, "Reply by email", EMAIL.panel),
    ].join("");

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="color-scheme" content="dark">
    <meta name="supported-color-schemes" content="dark">
    <title>New ${escapeHtml(SITE.name)} application</title>
</head>
<body style="margin: 0; padding: 0; background: ${EMAIL.page};">
    <div style="display: none; max-height: 0; overflow: hidden; opacity: 0;">${escapeHtml(preheader)}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="${EMAIL.page}" style="background: ${EMAIL.page};">
        <tr>
            <td align="center" style="padding: 24px 12px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="${EMAIL.card}" style="max-width: 600px; background: ${EMAIL.card}; border: 1px solid ${EMAIL.border}; border-radius: 12px;">
                    <tr>
                        <td align="center" style="padding: 32px 24px 8px 24px;">
                            <img src="${escapeHtml(logoUrl)}" width="240" height="17" alt="${escapeHtml(SITE.name)}" style="display: block; width: 240px; height: auto; border: 0;">
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 28px 32px 8px 32px; font-family: ${EMAIL.fontDisplay}; font-size: 30px; line-height: 1.15; font-weight: 900; color: ${EMAIL.text};">
                            ${escapeHtml(firstName)} wants to <span style="color: ${EMAIL.accent};">start coaching.</span>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 32px 24px 32px; font-family: ${EMAIL.fontBody}; font-size: 16px; line-height: 1.6; color: #D5D9E0;">
                            A new application just came in through the website. Here's what they told you.
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 32px 8px 32px; font-family: ${EMAIL.fontBody}; font-size: 12px; font-weight: bold; letter-spacing: 0.16em; text-transform: uppercase; color: ${EMAIL.accent};">
                            Contact details
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 0 32px 28px 32px; font-family: ${EMAIL.fontBody};">
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">${renderDetailRows(rows)}
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 0 32px 20px 32px;">${buttons}
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 0 32px;">
                            <div style="border-top: 1px solid ${EMAIL.border}; line-height: 1px; font-size: 1px;">&nbsp;</div>
                        </td>
                    </tr>
                    <tr>
                        <td align="center" style="padding: 20px 32px 32px 32px; font-family: ${EMAIL.fontBody}; font-size: 13px; line-height: 1.6; color: ${EMAIL.muted};">
                            ${escapeHtml(SITE.name)} · Application form<br>
                            Sent automatically from ${link(SITE.url, new URL(SITE.url).host)}
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;
}

function renderText(rows: DetailRow[], whatsAppUrl: string | null): string {
    const lines = [
        `New ${SITE.name} application`,
        "",
        ...rows.map((row) => `${row.label}: ${row.text}`),
    ];
    if (whatsAppUrl) {
        lines.push("", `Chat on WhatsApp: ${whatsAppUrl}`);
    }
    return lines.join("\n");
}

export function buildNotificationEmail(application: Application, options: NotificationEmailOptions = {}): NotificationEmail {
    const receivedAt = formatReceived(options.receivedAt ?? new Date(), options.timeZone ?? "Europe/Dublin");
    const rows = buildRows(application, receivedAt);
    const phone = normalizePhone(application.phone);
    const whatsAppUrl = phone ? whatsAppLink(phone) : null;
    const preheader = `${phone?.display ?? application.phone} · ${application.email}`;

    return {
        subject: `New ${SITE.name} client: ${application.name}`,
        html: renderHtml(application, rows, whatsAppUrl, preheader),
        text: renderText(rows, whatsAppUrl),
    };
}
