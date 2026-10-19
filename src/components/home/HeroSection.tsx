import React from "react";
import {HERO_CONTENT} from "@/constants/homeData";
import {AchieveBtn} from "./AchieveBtn";
import {AchieveImage} from "./AchieveImage";

export function HeroSection() {
    return (
        <section className="w hero">
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
                    <AchieveBtn href={HERO_CONTENT.ctaHref}>{HERO_CONTENT.ctaLabel}</AchieveBtn>
                </div>
            </div>
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
