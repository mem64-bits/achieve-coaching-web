import {useEffect, useRef} from "react";
import {ArrowLeft, ArrowRight} from "lucide-react";
import {AchieveBtn} from "@/components/common/AchieveBtn";
import {APPLY_FORM_COPY, APPLY_STEPS} from "@constants/applyForm";
import {APPLY_ENDPOINT} from "@/lib/api";
import {APPLICATION_FIELDS_BY_STEP} from "@/lib/apply/schema";
import {cn} from "@/lib/utils";
import {ApplySuccess} from "./ApplySuccess";
import {GoalStep} from "./GoalStep";
import {PhoneField} from "./PhoneField";
import {StepProgress} from "./StepProgress";
import {TextField} from "./TextField";
import {useApplyForm} from "./useApplyForm";

const fields = APPLY_FORM_COPY.fields;

export default function ApplyForm() {
    const apply = useApplyForm();
    const {register, formState, setFocus, control} = apply.form;
    const legendRef = useRef<HTMLLegendElement>(null);
    const hasMounted = useRef(false);

    useEffect(() => {
        if (!hasMounted.current) {
            hasMounted.current = true;
            return;
        }
        if (apply.direction === "forward") {
            setFocus(APPLICATION_FIELDS_BY_STEP[apply.stepId][0]);
        } else {
            legendRef.current?.focus();
        }
    }, [apply.stepIndex]);

    if (apply.status === "success") {
        return <ApplySuccess onStartOver={apply.startOver}/>;
    }

    const step = APPLY_STEPS[apply.stepId];
    const isSubmitting = apply.status === "submitting";
    const errors = formState.errors;

    return (
        <form noValidate method="post" action={APPLY_ENDPOINT} onSubmit={apply.onSubmit} className="flex flex-col gap-7">
            <StepProgress currentIndex={apply.stepIndex}/>

            <div aria-hidden="true" className="absolute -left-[9999px] size-px overflow-hidden">
                <label>
                    Leave this field empty
                    <input ref={apply.honeypotRef} type="text" name="botcheck" tabIndex={-1} autoComplete="off" defaultValue=""/>
                </label>
            </div>

            <fieldset
                key={apply.stepId}
                className={cn(
                    "min-w-0 animate-in fade-in-0 duration-300 motion-reduce:animate-none",
                    apply.direction === "forward" ? "slide-in-from-right-6" : "slide-in-from-left-6",
                )}
            >
                <legend
                    ref={legendRef}
                    tabIndex={-1}
                    className="font-display text-subtitle font-extrabold uppercase text-foreground outline-none"
                >
                    {step.title}
                </legend>
                <p className="mt-2 mb-6 text-muted-foreground">{step.description}</p>

                {apply.stepId === "goal" && <GoalStep register={register} error={errors.goal?.message}/>}

                {apply.stepId === "about" && (
                    <div className="flex flex-col gap-4">
                        <TextField
                            id="apply-name"
                            label={fields.name.label}
                            placeholder={fields.name.placeholder}
                            autoComplete="name"
                            autoCapitalize="words"
                            enterKeyHint="next"
                            required
                            error={errors.name?.message}
                            {...register("name")}
                        />
                        <TextField
                            id="apply-social"
                            label={fields.social.label}
                            hint={fields.social.hint}
                            placeholder={fields.social.placeholder}
                            autoComplete="off"
                            autoCapitalize="none"
                            autoCorrect="off"
                            spellCheck={false}
                            enterKeyHint="next"
                            error={errors.social?.message}
                            {...register("social")}
                        />
                    </div>
                )}

                {apply.stepId === "contact" && (
                    <div className="flex flex-col gap-4">
                        <PhoneField control={control}/>
                        <TextField
                            id="apply-email"
                            type="email"
                            label={fields.email.label}
                            placeholder={fields.email.placeholder}
                            autoComplete="email"
                            inputMode="email"
                            autoCapitalize="none"
                            autoCorrect="off"
                            spellCheck={false}
                            enterKeyHint="send"
                            required
                            error={errors.email?.message}
                            {...register("email")}
                        />
                    </div>
                )}
            </fieldset>

            {apply.serverError && (
                <div role="alert" className="rounded-xl border border-danger/40 bg-danger/10 p-4 text-sm text-danger">
                    {apply.serverError}
                </div>
            )}

            <div className="flex items-center gap-3">
                {apply.stepIndex > 0 && (
                    <AchieveBtn variant="outline" size="lg" onClick={apply.goBack} className="px-5">
                        <ArrowLeft aria-hidden="true" className="size-4"/>
                        <span className="sr-only sm:not-sr-only">{APPLY_FORM_COPY.actions.back}</span>
                    </AchieveBtn>
                )}
                <AchieveBtn
                    type="submit"
                    size="lg"
                    fullWidth
                    disabled={isSubmitting}
                    effect={apply.isLastStep ? "shimmer" : "none"}
                >
                    {apply.isLastStep
                        ? isSubmitting ? APPLY_FORM_COPY.actions.submitting : APPLY_FORM_COPY.actions.submit
                        : APPLY_FORM_COPY.actions.next}
                    {!apply.isLastStep && <ArrowRight aria-hidden="true" className="size-4"/>}
                </AchieveBtn>
            </div>
        </form>
    );
}
