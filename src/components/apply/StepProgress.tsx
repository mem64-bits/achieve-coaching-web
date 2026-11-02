import {APPLY_FORM_COPY, APPLY_STEP_IDS, APPLY_STEPS} from "@constants/applyForm";

interface StepProgressProps {
    currentIndex: number;
}

export function StepProgress({currentIndex}: StepProgressProps) {
    const total = APPLY_STEP_IDS.length;
    const currentStep = APPLY_STEPS[APPLY_STEP_IDS[currentIndex]];

    return (
        <nav aria-label="Application progress">
            <p className="eyebrow text-muted-foreground">
                {APPLY_FORM_COPY.progressLabel(currentIndex + 1, total)}
                <span className="text-foreground"> · {currentStep.shortLabel}</span>
            </p>
            <ol className="mt-3 grid grid-cols-3 gap-2">
                {APPLY_STEP_IDS.map((stepId, index) => (
                    <li
                        key={stepId}
                        aria-current={index === currentIndex ? "step" : undefined}
                        className="h-1.5 overflow-hidden rounded-full bg-white/10"
                    >
                        <span
                            aria-hidden="true"
                            style={{transform: `scaleX(${index <= currentIndex ? 1 : 0})`}}
                            className="block h-full origin-left rounded-full bg-achieve-blue shadow-[0_0_12px_var(--achieve-blue-glow)] transition-transform duration-500 ease-out motion-reduce:transition-none"
                        />
                        <span className="sr-only">
                            {APPLY_STEPS[stepId].shortLabel}
                            {index < currentIndex && " (done)"}
                        </span>
                    </li>
                ))}
            </ol>
        </nav>
    );
}
