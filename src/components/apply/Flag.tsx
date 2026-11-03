interface FlagProps {
    iso2: string;
    eager?: boolean;
}

export function Flag({iso2, eager = false}: FlagProps) {
    return (
        <img
            src={`/flags/${iso2}.svg`}
            alt=""
            width={22}
            height={15}
            loading={eager ? "eager" : "lazy"}
            decoding="async"
            className="h-[15px] w-[22px] shrink-0 rounded-[3px] object-cover shadow-[0_0_0_1px_var(--hairline-light)]"
        />
    );
}
