import {useEffect, useId, useMemo, useRef, useState, type KeyboardEvent, type MouseEvent} from "react";
import {ChevronDown, Search, X} from "lucide-react";
import {APPLY_FORM_COPY} from "@constants/applyForm";
import {searchCountries, type CountryOption} from "@/lib/apply/countrySearch";
import {cn} from "@/lib/utils";
import {Flag} from "./Flag";

interface CountryPickerProps {
    countries: CountryOption[];
    selected: CountryOption;
    onSelect: (iso2: string) => void;
    invalid?: boolean;
}

const copy = APPLY_FORM_COPY.countryPicker;

export function CountryPicker({countries, selected, onSelect, invalid = false}: CountryPickerProps) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const searchRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLUListElement>(null);
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [activeIndex, setActiveIndex] = useState(0);
    const baseId = useId();
    const listId = `${baseId}-list`;
    const titleId = `${baseId}-title`;
    const hintId = `${baseId}-hint`;

    const results = useMemo(() => searchCountries(query, countries), [query, countries]);
    const optionId = (iso2: string) => `${baseId}-option-${iso2}`;

    useEffect(() => {
        setActiveIndex(0);
    }, [query]);

    useEffect(() => {
        const active = results[activeIndex];
        if (open && active) {
            document.getElementById(optionId(active.iso2))?.scrollIntoView({block: "nearest"});
        }
    }, [activeIndex, open, results]);

    const openPicker = () => {
        setQuery("");
        setOpen(true);
        dialogRef.current?.showModal();
        requestAnimationFrame(() => {
            searchRef.current?.focus();
            const selectedIndex = countries.findIndex((country) => country.iso2 === selected.iso2);
            setActiveIndex(Math.max(selectedIndex, 0));
        });
    };

    const closePicker = () => dialogRef.current?.close();

    const choose = (country: CountryOption | undefined) => {
        if (!country) {
            return;
        }
        closePicker();
        onSelect(country.iso2);
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        const last = results.length - 1;
        const moves: Record<string, () => void> = {
            ArrowDown: () => setActiveIndex((index) => Math.min(index + 1, last)),
            ArrowUp: () => setActiveIndex((index) => Math.max(index - 1, 0)),
            Home: () => setActiveIndex(0),
            End: () => setActiveIndex(Math.max(last, 0)),
            Enter: () => choose(results[activeIndex]),
        };
        const move = moves[event.key];
        if (move && !event.nativeEvent.isComposing) {
            event.preventDefault();
            move();
        }
    };

    const closeOnBackdrop = (event: MouseEvent<HTMLDialogElement>) => {
        if (event.target === event.currentTarget) {
            closePicker();
        }
    };

    const active = results[activeIndex];

    return (
        <>
            <button
                type="button"
                onClick={openPicker}
                aria-haspopup="dialog"
                aria-label={copy.triggerLabel(selected.name, selected.dialCode)}
                className={cn(
                    "flex min-h-13 shrink-0 items-center gap-2 rounded-l-[0.625rem] border border-r-0 border-input bg-elevated pr-2.5 pl-3 text-base text-foreground transition-colors hover:bg-muted focus-visible:z-10",
                    invalid && "border-danger",
                )}
            >
                <Flag iso2={selected.iso2} eager/>
                <span className="tabular-nums">+{selected.dialCode}</span>
                <ChevronDown aria-hidden="true" className="size-4 text-muted-foreground"/>
            </button>

            <dialog
                ref={dialogRef}
                aria-labelledby={titleId}
                onClose={() => setOpen(false)}
                onClick={closeOnBackdrop}
                className="country-picker m-0 mt-auto w-full max-w-none rounded-t-3xl border border-white/10 bg-card p-0 text-foreground sm:m-auto sm:max-w-md sm:rounded-3xl"
            >
                {open && (
                    <div className="flex max-h-[min(80dvh,36rem)] flex-col animate-in fade-in-0 slide-in-from-bottom-4 duration-200 motion-reduce:animate-none">
                        <div className="flex items-center justify-between gap-3 px-5 pt-5">
                            <h2 id={titleId} className="font-display text-lg font-bold">{copy.title}</h2>
                            <button
                                type="button"
                                onClick={closePicker}
                                aria-label={copy.close}
                                className="grid size-11 place-items-center rounded-full border border-white/10 text-muted-foreground transition-colors hover:text-foreground"
                            >
                                <X aria-hidden="true" className="size-5"/>
                            </button>
                        </div>

                        <div className="px-5 pt-3 pb-3">
                            <div className="relative">
                                <Search aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"/>
                                <input
                                    ref={searchRef}
                                    type="search"
                                    role="combobox"
                                    aria-expanded="true"
                                    aria-controls={listId}
                                    aria-autocomplete="list"
                                    aria-activedescendant={active ? optionId(active.iso2) : undefined}
                                    aria-describedby={hintId}
                                    aria-label={copy.searchLabel}
                                    placeholder={copy.placeholder}
                                    value={query}
                                    onChange={(event) => setQuery(event.target.value)}
                                    onKeyDown={handleKeyDown}
                                    autoComplete="off"
                                    autoCorrect="off"
                                    spellCheck={false}
                                    enterKeyHint="done"
                                    className="min-h-12 w-full rounded-xl border border-input bg-background pr-4 pl-10 text-base text-foreground placeholder:text-muted-foreground/60 focus:border-achieve-blue focus:ring-1 focus:ring-achieve-blue focus:outline-none"
                                />
                            </div>
                            <p id={hintId} className="mt-2 text-xs text-muted-foreground">{copy.hint}</p>
                        </div>

                        <ul
                            ref={listRef}
                            id={listId}
                            role="listbox"
                            aria-label={copy.listLabel}
                            className="min-h-0 grow overflow-y-auto overscroll-contain px-2 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
                        >
                            {results.map((country, index) => {
                                const isActive = index === activeIndex;
                                const isSelected = country.iso2 === selected.iso2;
                                return (
                                    <li
                                        key={country.iso2}
                                        id={optionId(country.iso2)}
                                        role="option"
                                        aria-selected={isSelected}
                                        onClick={() => choose(country)}
                                        onMouseMove={() => setActiveIndex(index)}
                                        className={cn(
                                            "flex min-h-12 cursor-pointer items-center gap-3 rounded-xl px-3 text-base transition-colors",
                                            isActive && "bg-white/[0.06]",
                                            isSelected && "text-achieve-blue",
                                        )}
                                    >
                                        <Flag iso2={country.iso2}/>
                                        <span className="min-w-0 grow truncate">{country.name}</span>
                                        <span className="shrink-0 tabular-nums text-muted-foreground">+{country.dialCode}</span>
                                    </li>
                                );
                            })}
                            {results.length === 0 && (
                                <li role="presentation" className="px-3 py-6 text-center text-sm text-muted-foreground">
                                    {copy.empty(query)}
                                </li>
                            )}
                        </ul>
                    </div>
                )}
            </dialog>
        </>
    );
}
