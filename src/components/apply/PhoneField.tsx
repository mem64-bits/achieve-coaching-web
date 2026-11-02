import {useMemo} from "react";
import {Controller, type Control, type ControllerRenderProps, type ControllerFieldState} from "react-hook-form";
import {defaultCountries, parseCountry, usePhoneInput} from "react-international-phone";
import {APPLY_FORM_COPY} from "@constants/applyForm";
import type {CountryOption} from "@/lib/apply/countrySearch";
import {cn} from "@/lib/utils";
import type {Application, ApplicationInput} from "@/types/apply";
import {CountryPicker} from "./CountryPicker";
import {describedBy, FieldError} from "./FieldError";
import {fieldHintClass, fieldInputClass, fieldLabelClass} from "./fieldStyles";

interface PhoneFieldProps {
    control: Control<ApplicationInput, unknown, Application>;
    defaultCountry?: string;
}

interface PhoneControlProps {
    field: ControllerRenderProps<ApplicationInput, "phone">;
    fieldState: ControllerFieldState;
    defaultCountry: string;
}

const FIELD_ID = "apply-phone";
const HINT_ID = `${FIELD_ID}-hint`;
const ERROR_ID = `${FIELD_ID}-error`;

function useCountryOptions(): CountryOption[] {
    return useMemo(
        () =>
            defaultCountries
                .map(parseCountry)
                .map(({iso2, name, dialCode}) => ({iso2, name, dialCode}))
                .sort((a, b) => a.name.localeCompare(b.name)),
        [],
    );
}

function PhoneControl({field, fieldState, defaultCountry}: PhoneControlProps) {
    const countries = useCountryOptions();
    const phone = usePhoneInput({
        defaultCountry,
        value: field.value,
        countries: defaultCountries,
        disableDialCodeAndPrefix: true,
        onChange: ({phone: value}) => field.onChange(value),
    });

    const invalid = Boolean(fieldState.error);
    const selected = {iso2: phone.country.iso2, name: phone.country.name, dialCode: phone.country.dialCode};

    return (
        <div className="phone-field flex" data-invalid={invalid ? "true" : undefined}>
            <CountryPicker
                countries={countries}
                selected={selected}
                invalid={invalid}
                onSelect={(iso2) => phone.setCountry(iso2, {focusOnInput: true})}
            />
            <input
                id={FIELD_ID}
                name={field.name}
                type="tel"
                required
                autoComplete="tel"
                inputMode="tel"
                enterKeyHint="next"
                placeholder={APPLY_FORM_COPY.fields.phone.placeholder}
                value={phone.inputValue}
                onChange={phone.handlePhoneValueChange}
                onBlur={field.onBlur}
                ref={(element) => {
                    phone.inputRef.current = element;
                    field.ref(element);
                }}
                aria-invalid={invalid || undefined}
                aria-describedby={describedBy(HINT_ID, invalid && ERROR_ID)}
                aria-errormessage={invalid ? ERROR_ID : undefined}
                className={cn(fieldInputClass, "min-w-0 flex-1 rounded-l-none")}
            />
        </div>
    );
}

export function PhoneField({control, defaultCountry = "ie"}: PhoneFieldProps) {
    const copy = APPLY_FORM_COPY.fields.phone;

    return (
        <Controller
            name="phone"
            control={control}
            render={({field, fieldState}) => (
                <div className="flex flex-col gap-1.5">
                    <label htmlFor={FIELD_ID} className={fieldLabelClass}>
                        {copy.label}
                    </label>
                    <p id={HINT_ID} className={fieldHintClass}>{copy.hint}</p>
                    <PhoneControl field={field} fieldState={fieldState} defaultCountry={defaultCountry}/>
                    <FieldError id={ERROR_ID} message={fieldState.error?.message}/>
                </div>
            )}
        />
    );
}
