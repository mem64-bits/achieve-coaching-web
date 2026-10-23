import React from "react";
import {FOR_YOU_IF_LIST} from "@/constants/homeData";

export function QualificationSection() {
    return (
        <section id="philosophy" className="w sec two justify-center scroll-mt-24">
            <div className="flex-1 basis-full sm:basis-105 max-w-180 mx-auto">
                <h2 className="achieve-h2 text-[28px] sm:text-[34px]! !mb-6">
                    This is for you <span className="a">if</span>
                </h2>
                <ul className="flex flex-col gap-3.5 m-0 p-0 list-none">
                    {FOR_YOU_IF_LIST.map((line) => (
                        <li key={line} className="flex items-start gap-3.5 text-[15px] sm:text-[17px] text-zinc-200 leading-relaxed">
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
