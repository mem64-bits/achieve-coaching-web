import type {APIRoute} from "astro";
import {NOTIFICATION_EMAIL, RESEND_API_KEY} from "astro:env/server";
import {handleApplicationRequest} from "@/lib/apply/handleApplication";
import {ResendApplicationNotifier} from "@/lib/apply/notifier";

export const prerender = false;

const NOTIFICATION_SENDER = "Achieve Coaching <notifications@achieve-coaching.net>";

const notifier = RESEND_API_KEY
    ? new ResendApplicationNotifier({apiKey: RESEND_API_KEY, from: NOTIFICATION_SENDER, to: NOTIFICATION_EMAIL})
    : null;

export const POST: APIRoute = ({request}) => handleApplicationRequest(request, {notifier});
