import {Resend} from "resend";
import type {NotificationEmail} from "./notificationEmail";

export interface ApplicationNotifier {
    send(email: NotificationEmail, replyTo: string): Promise<void>;
}

export interface ResendNotifierOptions {
    apiKey: string;
    from: string;
    to: string;
}

export class ResendApplicationNotifier implements ApplicationNotifier {
    private readonly client: Resend;

    constructor(private readonly options: ResendNotifierOptions) {
        this.client = new Resend(options.apiKey);
    }

    async send(email: NotificationEmail, replyTo: string): Promise<void> {
        const {error} = await this.client.emails.send({
            from: this.options.from,
            to: [this.options.to],
            replyTo,
            subject: email.subject,
            html: email.html,
            text: email.text,
        });

        if (error) {
            throw new Error(`Resend rejected the email: ${error.name}`);
        }
    }
}
