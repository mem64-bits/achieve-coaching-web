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
            <div className="flex-1 basis-110 flex flex-col gap-6">
                <h1 className="achieve-h1">
                    {HERO_CONTENT.titlePrefix}{" "}
                    <span className="a">{HERO_CONTENT.titleHighlight}</span>{" "}
                    {HERO_CONTENT.titleSuffix}
                </h1>
                <p className="m-0 text-[19px] font-normal max-w-130 text-[#B8B8B8] leading-normal">
                    {HERO_CONTENT.subtitle}
                </p>
                <div>
                    <AchieveBtn href={HERO_CONTENT.ctaHref}>
                        {HERO_CONTENT.ctaLabel}
                    </AchieveBtn>
                </div>
            </div>
            <div className="flex-1 basis-[320px] max-w-110">
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
            <SectionTitle titleStart="How it" titleAccent="works"/>
            <div>
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
        <section id="philosophy" className="w sec two scroll-mt-24">
            <div className="flex-1 basis-105 max-w-180">
                <h2 className="achieve-h2 text-[34px]! !mb-3.5">
                    This is for you <span className="a">if</span>
                </h2>
                {FOR_YOU_IF_LIST.map((line, idx) => (
                    <p key={idx} className="m-0 mb-2 text-muted-foreground">
                        {line}
                    </p>
                ))}
            </div>
        </section>
    );
}