import type {ComponentProps} from "react";
import {cn} from "@/lib/utils";
import {describedBy, FieldError} from "./FieldError";
import {fieldHintClass, fieldInputClass, fieldLabelClass} from "./fieldStyles";

export interface TextFieldProps extends Omit<ComponentProps<"input">, "id"> {
    id: string;
    label: string;
    hint?: string;
    optionalTag?: string;
    error?: string;
}

export function TextField({id, label, hint, optionalTag, error, className, ...inputProps}: TextFieldProps) {
    const hintId = hint ? `${id}-hint` : undefined;
    const errorId = `${id}-error`;

    return (
        <div className="flex flex-col gap-1.5">
            <label htmlFor={id} className={fieldLabelClass}>
                {label}
                {optionalTag && (
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{optionalTag}</span>
                )}
            </label>
            {hint && <p id={hintId} className={fieldHintClass}>{hint}</p>}
            <input
                id={id}
                aria-invalid={error ? true : undefined}
                aria-describedby={describedBy(hintId, error && errorId)}
                aria-errormessage={error ? errorId : undefined}
                className={cn(fieldInputClass, className)}
                {...inputProps}
            />
            <FieldError id={errorId} message={error}/>
        </div>
    );
}
