import type {StepItem} from "@constants/homeData";

export function StepRow({stepNumber, title, description}: StepItem) {
    return (
        <div className="relative flex gap-5">
            <span className="relative z-10 grid size-12 shrink-0 place-items-center rounded-full border border-achieve-blue/40 bg-black font-display text-lg font-extrabold text-achieve-blue shadow-[0_0_24px_var(--achieve-blue-glow)]">
                {stepNumber}
            </span>
            <div className="pt-2 pb-2">
                <h3 className="font-display text-subtitle font-bold text-foreground">{title}</h3>
                <p className="mt-2 text-base leading-relaxed text-muted-foreground">{description}</p>
            </div>
        </div>
    );
}
