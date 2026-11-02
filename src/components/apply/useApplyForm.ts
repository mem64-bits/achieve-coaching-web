import {useEffect, useRef, useState, type SubmitEvent} from "react";
import {useForm, type FieldErrors} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {APPLY_FORM_COPY, APPLY_STEP_IDS, type ApplyStepId} from "@constants/applyForm";
import {ApplicationSubmitError, submitApplication} from "@/lib/api";
import {APPLICATION_FIELDS_BY_STEP, applicationSchema} from "@/lib/apply/schema";
import type {Application, ApplicationField, ApplicationInput} from "@/types/apply";

export type ApplyStatus = "editing" | "submitting" | "success";
export type StepDirection = "forward" | "back";

const DEFAULT_VALUES: Partial<ApplicationInput> = {
    goal: undefined,
    name: "",
    social: "",
    phone: "",
    email: "",
};

function stepIndexOfField(field: ApplicationField): number {
    return APPLY_STEP_IDS.findIndex((stepId) =>
        (APPLICATION_FIELDS_BY_STEP[stepId] as readonly ApplicationField[]).includes(field),
    );
}

function firstStepWithError(fields: ApplicationField[]): number {
    const indexes = fields.map(stepIndexOfField).filter((index) => index >= 0);
    return indexes.length > 0 ? Math.min(...indexes) : -1;
}

export function useApplyForm() {
    const form = useForm<ApplicationInput, unknown, Application>({
        resolver: zodResolver(applicationSchema),
        mode: "onTouched",
        reValidateMode: "onChange",
        defaultValues: DEFAULT_VALUES,
        shouldFocusError: true,
    });

    const [stepIndex, setStepIndex] = useState(0);
    const [direction, setDirection] = useState<StepDirection>("forward");
    const [status, setStatus] = useState<ApplyStatus>("editing");
    const [serverError, setServerError] = useState<string | null>(null);
    const startedAt = useRef(0);
    const honeypotRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        startedAt.current = performance.now();
    }, []);

    const stepId: ApplyStepId = APPLY_STEP_IDS[stepIndex];
    const totalSteps = APPLY_STEP_IDS.length;
    const isLastStep = stepIndex === totalSteps - 1;

    const goToStep = (index: number, nextDirection: StepDirection) => {
        setDirection(nextDirection);
        setStepIndex(index);
    };

    const goBack = () => {
        if (stepIndex > 0) {
            goToStep(stepIndex - 1, "back");
        }
    };

    const goNext = async () => {
        const fields = [...APPLICATION_FIELDS_BY_STEP[stepId]];
        const isStepValid = await form.trigger(fields, {shouldFocus: true});
        if (isStepValid) {
            goToStep(stepIndex + 1, "forward");
        }
    };

    const showErrorsFromEarlierSteps = (fields: ApplicationField[]) => {
        const target = firstStepWithError(fields);
        if (target >= 0 && target < stepIndex) {
            goToStep(target, "back");
        }
    };

    const applyServerFieldErrors = (fieldErrors: ApplicationSubmitError["fieldErrors"]) => {
        const fields = Object.keys(fieldErrors ?? {}) as ApplicationField[];
        for (const field of fields) {
            form.setError(field, {type: "server", message: fieldErrors?.[field]});
        }
        showErrorsFromEarlierSteps(fields);
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

    const onInvalid = (errors: FieldErrors<ApplicationInput>) => {
        showErrorsFromEarlierSteps(Object.keys(errors) as ApplicationField[]);
    };

    const onSubmit = (event: SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (status === "submitting") {
            return;
        }
        if (!isLastStep) {
            void goNext();
            return;
        }
        void form.handleSubmit(send, onInvalid)(event);
    };

    const startOver = () => {
        form.reset(DEFAULT_VALUES);
        setServerError(null);
        setStatus("editing");
        goToStep(0, "back");
        startedAt.current = performance.now();
    };

    return {
        form,
        stepId,
        stepIndex,
        totalSteps,
        isLastStep,
        direction,
        status,
        serverError,
        honeypotRef,
        onSubmit,
        goBack,
        startOver,
    };
}
