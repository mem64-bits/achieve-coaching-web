// src/components/home/Sections.tsx
import React from "react";
import {
    HERO_CONTENT,
    MOSAIC_COLUMNS,
    HOW_IT_WORKS_STEPS,
    FOR_YOU_IF_LIST,
} from "@constants/homeData.ts";
import {
    AchieveBtn,
    SectionTitle,
    AchieveImage,
    QuoteCard,
    StepRow,
} from "./Primitives";

/** SECTION 1: Hero (.w.hero) */
export function HeroSection() {
    return (
        <section className="w hero">
            {/* Left Content Column */}

            {/*Header Quote*/}
            <div className="flex-1 basis-[440px] flex flex-col gap-6">
                <h1 className="achieve-h1">
                    <span className="block">{HERO_CONTENT.titlePrefix}</span>
                    <span className="block a">{HERO_CONTENT.titleHighlight}</span>
                    <span className="block">{HERO_CONTENT.titleSuffix}</span>
                </h1>

                <p className="m-0 text-[19px] font-normal max-w-[520px] text-muted-foreground leading-normal">
                    {HERO_CONTENT.subtitle}
                </p>

                <div>
                    <AchieveBtn href={HERO_CONTENT.ctaHref}>
                        {HERO_CONTENT.ctaLabel}
                    </AchieveBtn>
                </div>
            </div>

            {/* Right Image Column */}
            <div className="flex-1 basis-[320px] max-w-[440px] w-full">
                <AchieveImage
                    filename={HERO_CONTENT.imageFilename}
                    alt={HERO_CONTENT.imageAlt}
                    eager
                />
            </div>
        </section>
    );
}

/** SECTION 2: Client Results Mosaic (.w.sec -> .mosaic) */
export function ResultsMosaicSection() {
    return (
        <section id="transformations" className="w sec scroll-mt-24">
            <SectionTitle
                label="Client results"
                titleStart="Real clients."
                titleAccent="Real results."
            />
            <div className="mosaic">
                {MOSAIC_COLUMNS.map((col, colIndex) => (
                    <div key={`col-${colIndex}`} className="mc">
                        {col.map((entry, entryIndex) =>
                            entry.type === "quote" ? (
                                <QuoteCard
                                    key={`entry-${colIndex}-${entryIndex}`}
                                    quote={entry.quote}
                                    author={entry.author}
                                    isLong={entry.isLong}
                                />
                            ) : (
                                <AchieveImage
                                    key={`entry-${colIndex}-${entryIndex}`}
                                    filename={entry.filename}
                                    alt={entry.alt}
                                />
                            )
                        )}
                    </div>
                ))}
            </div>
            <div className="mt-6">
                <AchieveBtn href="#apply">Apply</AchieveBtn>
            </div>
        </section>
    );
}

/** SECTION 3: How It Works (.w.sec -> .step) */
export function HowItWorksSection() {
    return (
        <section id="process" className="w sec scroll-mt-24">
            {/* Center the title */}
            <div className="text-center mb-8">
                <SectionTitle titleStart="How it" titleAccent="works"/>
            </div>

            {/* Constrain width and center with mx-auto */}
            <div className="max-w-[720px] mx-auto">
                {HOW_IT_WORKS_STEPS.map((step) => (
                    <StepRow key={step.stepNumber} {...step} />
                ))}
            </div>
        </section>
    );
}

/** SECTION 4: Qualification (.w.sec.two) */
export function QualificationSection() {
    return (
        <section id="philosophy" className="w sec two justify-center scroll-mt-24">
            <div className="flex-1 basis-105 max-w-180 mx-auto">
                <h2 className="achieve-h2 text-[34px]! !mb-6">
                    This is for you <span className="a">if</span>
                </h2>

                <ul className="flex flex-col gap-3.5 m-0 p-0 list-none">
                    {FOR_YOU_IF_LIST.map((line, idx) => (
                        <li
                            key={idx}
                            className="flex items-start gap-3.5 text-[17px] text-zinc-200 leading-relaxed"
                        >
                            {/* Achieve-Blue Solid Square */}
                            <span
                                className="shrink-0 mt-2 h-2.5 w-2.5 rounded-[2px] bg-achieve-blue shadow-[0_0_8px_rgba(61,123,255,0.6)]"
                                aria-hidden="true"
                            />
                            <span>{line}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}