// src/pages/api/apply.ts
import type {APIRoute} from 'astro';
import {Resend} from 'resend';

// Required: tells Astro & Vercel to run this on-demand as a serverless function
export const prerender = false;

// Safe retrieval for Vercel Serverless environment variables
const apiKey = import.meta.env.RESEND_API_KEY || process.env.RESEND_API_KEY || "re_dummy_test_key";
const resend = new Resend(apiKey);

// Fallback recipient email to guarantee delivery
const targetNotificationEmail =
    import.meta.env.NOTIFICATION_EMAIL ||
    process.env.NOTIFICATION_EMAIL ||
    "coachbobbyachieve@gmail.com";

// -------------------------------------------------------------
// Validation Helpers
// -------------------------------------------------------------

// 1. Phone / WhatsApp Validation (E.164 standard: 8 to 15 digits)
export function validateAndCleanPhone(phone: string) {
    if (!phone) return {isValid: false, cleanDigits: "", formatted: ""};

    const formatted = phone.trim();
    const cleanDigits = formatted.replace(/\D/g, '');
    // Allow plus, digits, spaces, dashes, parentheses, dots
    const hasValidChars = /^[\+\d\s\-\(\)\.]+$/.test(formatted);

    const isValid = hasValidChars && cleanDigits.length >= 8 && cleanDigits.length <= 15;
    return {isValid, cleanDigits, formatted};
}

// 2. Instagram Validation (1-30 chars, letters, numbers, periods, underscores)
export function validateAndCleanInstagram(input?: string) {
    if (!input || !input.trim()) return {isValid: true, handle: "", url: ""};

    let handle = input.trim();
    // Strip URL prefixes if user pasted a link (e.g., https://instagram.com/user/)
    handle = handle.replace(/^(https?:\/\/)?(www\.)?instagram\.com\//i, '');
    handle = handle.replace(/^@/, ''); // Strip leading @
    handle = handle.replace(/[/?#].*$/, ''); // Strip trailing slashes or query params

    // Instagram username spec: max 30 characters, alphanumeric, periods, underscores
    const isValid = /^[a-zA-Z0-9._]{1,30}$/.test(handle);
    const url = isValid ? `https://instagram.com/${handle}` : "";

    return {isValid, handle, url};
}

// 3. Email Validation
export function validateEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

// -------------------------------------------------------------
// API Handler
// -------------------------------------------------------------
export const POST: APIRoute = async ({request}) => {
    try {
        const body = await request.json();
        const {
            first_name,
            last_name,
            email,
            phone,
            instagram,
            botcheck
        } = body;

        // 1. Honeypot check (silently drop bot submissions)
        if (botcheck) {
            return new Response(JSON.stringify({success: true}), {status: 200});
        }

        // 2. Required fields check
        if (!first_name?.trim() || !last_name?.trim() || !email?.trim() || !phone?.trim()) {
            return new Response(
                JSON.stringify({error: "Please fill in all required fields (Name, Email, and Phone)."}),
                {status: 400}
            );
        }

        // 3. Email check
        if (!validateEmail(email)) {
            return new Response(
                JSON.stringify({error: "Please enter a valid email address."}),
                {status: 400}
            );
        }

        // 4. WhatsApp / Phone check
        const phoneData = validateAndCleanPhone(phone);
        if (!phoneData.isValid) {
            return new Response(
                JSON.stringify({
                    error: "Please enter a valid phone number with country code (e.g. +353 87 123 4567 or +1 555 123 4567)."
                }),
                {status: 400}
            );
        }

        // 5. Instagram check (optional field, but validated if provided)
        const instaData = validateAndCleanInstagram(instagram);
        if (!instaData.isValid) {
            return new Response(
                JSON.stringify({
                    error: "Please enter a valid Instagram handle (e.g. @yourname) or profile link."
                }),
                {status: 400}
            );
        }

        // 6. Send notification email via Resend with your verified domain
        const {data, error} = await resend.emails.send({
            from: 'Achieve Coaching <notifications@achieve-coaching.net>', // <-- YOUR VERIFIED DOMAIN
            replyTo: email.trim(), // <-- Hitting "Reply" in Gmail replies to the client
            to: [targetNotificationEmail],
            subject: `New Achieve Coaching Client: ${first_name.trim()} ${last_name.trim()}`,
            html: `
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #373A3F; border-radius: 8px; background: #0A0A0B; color: #FFFFFF;">
                    <h2 style="color: #3D7BFF; text-transform: uppercase; margin-top: 0; font-size: 22px;">New Achieve Coaching Application</h2>
                    
                    <p style="font-size: 15px; color: #8B93A1; margin-bottom: 20px;">A prospective client just submitted an application on your website:</p>

                    <table style="width: 100%; border-collapse: collapse; font-size: 15px;">
                        <tr>
                            <td style="padding: 10px 0; color: #8B93A1; width: 140px; border-bottom: 1px solid #1A1B1D;">Name:</td>
                            <td style="font-weight: bold; color: #FFFFFF; border-bottom: 1px solid #1A1B1D;">${first_name.trim()} ${last_name.trim()}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px 0; color: #8B93A1; border-bottom: 1px solid #1A1B1D;">Email:</td>
                            <td style="border-bottom: 1px solid #1A1B1D;">
                                <a href="mailto:${email.trim()}" style="color: #3D7BFF; text-decoration: none;">${email.trim()}</a>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 10px 0; color: #8B93A1; border-bottom: 1px solid #1A1B1D;">Phone:</td>
                            <td style="color: #FFFFFF; font-weight: bold; border-bottom: 1px solid #1A1B1D;">${phoneData.formatted}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px 0; color: #8B93A1; border-bottom: 1px solid #1A1B1D;">Instagram:</td>
                            <td style="border-bottom: 1px solid #1A1B1D;">
                                ${
                instaData.handle
                    ? `<a href="${instaData.url}" target="_blank" style="color: #3D7BFF; text-decoration: none;">@${instaData.handle} (Open Profile ↗)</a>`
                    : `<span style="color: #8B93A1;">None provided</span>`
            }
                            </td>
                        </tr>
                    </table>

                    <!-- WhatsApp Quick CTA Button -->
                    <div style="margin-top: 28px; text-align: center;">
                        <a href="https://wa.me/${phoneData.cleanDigits}" style="display: inline-block; background: #25D366; color: #FFFFFF; font-weight: bold; text-decoration: none; padding: 14px 28px; border-radius: 6px; font-size: 15px; letter-spacing: 0.02em;">
                            Chat with Client on WhatsApp →
                        </a>
                    </div>
                </div>
            `,
        });

        if (error) {
            console.error("Resend error:", error);
            return new Response(JSON.stringify({error: error.message}), {status: 500});
        }

        return new Response(JSON.stringify({success: true, id: data?.id}), {status: 200});

    } catch (err: any) {
        console.error("API error:", err);
        return new Response(JSON.stringify({error: err.message || "Server error"}), {status: 500});
    }
};