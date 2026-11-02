import {Controller, type Control} from "react-hook-form";
import {PhoneInput} from "react-international-phone";
import "react-international-phone/style.css";
import {APPLY_FORM_COPY} from "@constants/applyForm";
import type {Application, ApplicationInput} from "@/types/apply";
import {describedBy, FieldError} from "./FieldError";
import {fieldHintClass, fieldLabelClass} from "./fieldStyles";

interface PhoneFieldProps {
    control: Control<ApplicationInput, unknown, Application>;
    defaultCountry?: string;
}

const FIELD_ID = "apply-phone";

export function PhoneField({control, defaultCountry = "ie"}: PhoneFieldProps) {
    const copy = APPLY_FORM_COPY.fields.phone;
    const hintId = `${FIELD_ID}-hint`;
    const errorId = `${FIELD_ID}-error`;

    return (
        <Controller
            name="phone"
            control={control}
            render={({field, fieldState}) => (
                <div className="flex flex-col gap-1.5">
                    <label htmlFor={FIELD_ID} className={fieldLabelClass}>
                        {copy.label}
                    </label>
                    <p id={hintId} className={fieldHintClass}>{copy.hint}</p>
                    <div className="phone-field" data-invalid={fieldState.error ? "true" : undefined}>
                        <PhoneInput
                            ref={field.ref}
                            defaultCountry={defaultCountry}
                            value={field.value}
                            onChange={(phone) => field.onChange(phone)}
                            inputProps={{
                                id: FIELD_ID,
                                name: field.name,
                                required: true,
                                autoComplete: "tel",
                                inputMode: "tel",
                                enterKeyHint: "next",
                                onBlur: field.onBlur,
                                "aria-invalid": fieldState.error ? true : undefined,
                                "aria-describedby": describedBy(hintId, fieldState.error && errorId),
                                "aria-errormessage": fieldState.error ? errorId : undefined,
                            }}
                        />
                    </div>
                    <FieldError id={errorId} message={fieldState.error?.message}/>
                </div>
            )}
        />
    );
}
