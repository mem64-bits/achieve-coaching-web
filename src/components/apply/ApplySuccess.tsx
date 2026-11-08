import {useEffect, useRef} from "react";
import {Check} from "lucide-react";
import {APPLY_FORM_COPY} from "@constants/applyForm";

interface ApplySuccessProps {
    onStartOver: () => void;
}

export function ApplySuccess({onStartOver}: ApplySuccessProps) {
    const headingRef = useRef<HTMLHeadingElement>(null);
    const copy = APPLY_FORM_COPY.success;

    useEffect(() => {
        headingRef.current?.focus();
    }, []);

    return (
        <div className="flex flex-col items-center py-6 text-center animate-in fade-in-0 zoom-in-95 duration-500 motion-reduce:animate-none">
            <span className="grid size-16 place-items-center rounded-full border border-achieve-blue/40 bg-achieve-soft text-achieve-blue shadow-[0_0_30px_var(--achieve-blue-glow)]">
                <Check aria-hidden="true" className="size-8"/>
            </span>
            <h3 ref={headingRef} tabIndex={-1} className="mt-5 font-display text-subtitle font-extrabold uppercase text-foreground outline-none">
                {copy.title}
            </h3>
            <p className="mt-3 max-w-[28rem] text-base text-muted-foreground sm:text-lg">{copy.body}</p>
            <button
                type="button"
                onClick={onStartOver}
                className="mt-6 min-h-11 text-sm text-achieve-blue underline underline-offset-4 transition-opacity hover:opacity-80"
            >
                {copy.reset}
            </button>
        </div>
    );
}
