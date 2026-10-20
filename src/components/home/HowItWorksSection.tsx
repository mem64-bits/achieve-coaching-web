import React from "react";
import {HOW_IT_WORKS_STEPS} from "@/constants/homeData";
import {SectionTitle} from "./SectionTitle";
import {StepRow} from "./StepRow";
import {SectionContainer} from "@/components/ui/SectionContainer";

export function HowItWorksSection() {
    return (
        <SectionContainer id="process" maxWidth="narrow" spacing="relaxed" className="scroll-mt-24">
            <div className="text-center mb-8">
                <SectionTitle titleStart="How it" titleAccent="works"/>
            </div>
            <div className="flex flex-col">
                {HOW_IT_WORKS_STEPS.map((step) => <StepRow key={step.stepNumber} {...step}/>)}
            </div>
        </SectionContainer>
    );
}
