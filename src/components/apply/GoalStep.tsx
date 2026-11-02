import {Check} from "lucide-react";
import type {UseFormRegister} from "react-hook-form";
import {GOAL_IDS, GOAL_OPTIONS} from "@constants/applyForm";
import type {ApplicationInput} from "@/types/apply";
import {describedBy, FieldError} from "./FieldError";

interface GoalStepProps {
    register: UseFormRegister<ApplicationInput>;
    error?: string;
}

const ERROR_ID = "apply-goal-error";

export function GoalStep({register, error}: GoalStepProps) {
    return (
        <div className="flex flex-col gap-2">
            <div className="grid gap-3 sm:grid-cols-2">
                {GOAL_IDS.map((goalId) => {
                    const option = GOAL_OPTIONS[goalId];
                    return (
                        <label
                            key={goalId}
                            className="group relative flex min-h-16 cursor-pointer items-start gap-3.5 rounded-2xl border border-input bg-background p-4 transition-[border-color,background-color,box-shadow] duration-200 hover:border-achieve-blue/60 has-checked:border-achieve-blue has-checked:bg-achieve-soft has-checked:shadow-[0_0_24px_var(--achieve-blue-glow)] has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-achieve-blue"
                        >
                            <input
                                type="radio"
                                value={goalId}
                                className="peer sr-only"
                                aria-describedby={describedBy(error && ERROR_ID)}
                                {...register("goal")}
                            />
                            <span
                                aria-hidden="true"
                                className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border-2 border-border-strong transition-colors peer-checked:border-achieve-blue peer-checked:bg-achieve-blue"
                            >
                                <Check className="size-3 text-white opacity-0 transition-opacity group-has-checked:opacity-100"/>
                            </span>
                            <span className="flex flex-col gap-0.5">
                                <span className="font-display font-bold text-foreground">{option.label}</span>
                                <span className="text-sm text-muted-foreground">{option.description}</span>
                            </span>
                        </label>
                    );
                })}
            </div>
            <FieldError id={ERROR_ID} message={error}/>
        </div>
    );
}
