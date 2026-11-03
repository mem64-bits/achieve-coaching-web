import {useEffect, useRef, useState, type SubmitEvent} from "react";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {APPLY_FORM_COPY} from "@constants/applyForm";
import {ApplicationSubmitError, submitApplication} from "@/lib/api";
import {applicationSchema} from "@/lib/apply/schema";
import type {Application, ApplicationField, ApplicationInput} from "@/types/apply";

export type ApplyStatus = "editing" | "submitting" | "success";

const DEFAULT_VALUES: ApplicationInput = {
    name: "",
    social: "",
    phone: "",
    email: "",
};

export function useApplyForm() {
    const form = useForm<ApplicationInput, unknown, Application>({
        resolver: zodResolver(applicationSchema),
        mode: "onTouched",
        reValidateMode: "onChange",
        defaultValues: DEFAULT_VALUES,
        shouldFocusError: true,
    });

    const [status, setStatus] = useState<ApplyStatus>("editing");
    const [serverError, setServerError] = useState<string | null>(null);
    const startedAt = useRef(0);
    const honeypotRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        startedAt.current = performance.now();
    }, []);

    const applyServerFieldErrors = (fieldErrors: ApplicationSubmitError["fieldErrors"]) => {
        const fields = Object.keys(fieldErrors ?? {}) as ApplicationField[];
        for (const field of fields) {
            form.setError(field, {type: "server", message: fieldErrors?.[field]});
        }
        if (fields.length > 0) {
            form.setFocus(fields[0]);
        }
    };

    const send = async (application: Application) => {
        setStatus("submitting");
        setServerError(null);

        try {
            await submitApplication({
                ...application,
                botcheck: honeypotRef.current?.value ?? "",
                elapsedMs: Math.round(performance.now() - startedAt.current),
            });
            setStatus("success");
        } catch (error) {
            const failure = error instanceof ApplicationSubmitError
                ? error
                : new ApplicationSubmitError(APPLY_FORM_COPY.errors.generic);
            setStatus("editing");
            applyServerFieldErrors(failure.fieldErrors);
            setServerError(failure.message);
        }
    };

    const onSubmit = (event: SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (status === "submitting") {
            return;
        }
        void form.handleSubmit(send)(event);
    };

    const startOver = () => {
        form.reset(DEFAULT_VALUES);
        setServerError(null);
        setStatus("editing");
        startedAt.current = performance.now();
    };

    return {
        form,
        status,
        serverError,
        honeypotRef,
        onSubmit,
        startOver,
    };
}
