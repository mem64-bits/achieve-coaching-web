import {CircleAlert} from "lucide-react";

interface FieldErrorProps {
    id: string;
    message?: string;
}

export function FieldError({id, message}: FieldErrorProps) {
    return (
        <p id={id} aria-live="polite" className="flex min-h-5 items-start gap-1.5 text-sm text-danger">
            {message && (
                <>
                    <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0"/>
                    <span>{message}</span>
                </>
            )}
        </p>
    );
}

export function describedBy(...ids: Array<string | false | undefined>): string | undefined {
    const value = ids.filter(Boolean).join(" ");
    return value || undefined;
}
