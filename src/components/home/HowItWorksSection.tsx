import React from "react";
import {HOW_IT_WORKS_STEPS} from "@/constants/homeData";
import {SectionTitle} from "./SectionTitle";
import {StepRow} from "./StepRow";

export function HowItWorksSection() {
    return (
        <section id="process" className="w sec scroll-mt-24">
            <div className="text-center mb-8">
                <SectionTitle titleStart="How it" titleAccent="works"/>
            </div>
            <div className="max-w-[720px] mx-auto">
                {HOW_IT_WORKS_STEPS.map((step) => <StepRow key={step.stepNumber} {...step}/>)}
            </div>
        </section>
    );
}
