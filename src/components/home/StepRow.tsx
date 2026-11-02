import React from "react";
import type {StepItem} from "@/constants/homeData";

export function StepRow({stepNumber, title, description}: StepItem) {
    return (
        <div className="step">
            <b>{stepNumber}</b>
            <div>
                <h3>{title}</h3>
                <p>{description}</p>
            </div>
        </div>
    );
}
