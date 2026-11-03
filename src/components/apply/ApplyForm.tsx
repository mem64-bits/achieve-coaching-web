import {AchieveBtn} from "@/components/common/AchieveBtn";
import {APPLY_FORM_COPY} from "@constants/applyForm";
import {APPLY_ENDPOINT} from "@/lib/api";
import {ApplySuccess} from "./ApplySuccess";
import {PhoneField} from "./PhoneField";
import {TextField} from "./TextField";
import {useApplyForm} from "./useApplyForm";

const fields = APPLY_FORM_COPY.fields;

export default function ApplyForm() {
    const apply = useApplyForm();
    const {register, formState, control} = apply.form;

    if (apply.status === "success") {
        return <ApplySuccess onStartOver={apply.startOver}/>;
    }

    const isSubmitting = apply.status === "submitting";
    const errors = formState.errors;

    return (
        <form noValidate method="post" action={APPLY_ENDPOINT} onSubmit={apply.onSubmit} className="flex flex-col gap-7">
            <div aria-hidden="true" className="absolute -left-[9999px] size-px overflow-hidden">
                <label>
                    Leave this field empty
                    <input ref={apply.honeypotRef} type="text" name="botcheck" tabIndex={-1} autoComplete="off" defaultValue=""/>
                </label>
            </div>

            <fieldset className="min-w-0">
                <legend className="font-display text-subtitle font-extrabold uppercase text-foreground">
                    {APPLY_FORM_COPY.formTitle}
                </legend>
                <p className="mt-2 mb-6 text-muted-foreground">{APPLY_FORM_COPY.formDescription}</p>

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
                        enterKeyHint="next"
                        required
                        error={errors.email?.message}
                        {...register("email")}
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
                        enterKeyHint="send"
                        error={errors.social?.message}
                        {...register("social")}
                    />
                </div>
            </fieldset>

            {apply.serverError && (
                <div role="alert" className="rounded-xl border border-danger/40 bg-danger/10 p-4 text-sm text-danger">
                    {apply.serverError}
                </div>
            )}

            <AchieveBtn type="submit" size="lg" fullWidth disabled={isSubmitting}>
                {isSubmitting ? APPLY_FORM_COPY.actions.submitting : APPLY_FORM_COPY.actions.submit}
            </AchieveBtn>
        </form>
    );
}
