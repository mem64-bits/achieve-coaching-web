import type {ApplicationField} from "@/lib/apply/schema";

export type {
    Application,
    ApplicationField,
    ApplicationInput,
    ApplicationSubmission,
} from "@/lib/apply/schema";

export interface ApplyResponseData {
    success?: boolean;
    error?: string;
    fieldErrors?: Partial<Record<ApplicationField, string>>;
}
