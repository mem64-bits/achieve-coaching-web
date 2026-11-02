import React from "react";
import {MOSAIC_COLUMNS} from "@/constants/homeData";
import {AchieveBtn} from "./AchieveBtn";
import {AchieveImage} from "./AchieveImage";
import {QuoteCard} from "./QuoteCard";
import {SectionTitle} from "./SectionTitle";

export function ResultsMosaicSection() {
    return (
        <section id="transformations" className="w sec scroll-mt-24">
            <SectionTitle label="" titleStart="Real clients." titleAccent="Real results."/>
            <div className="mosaic">
                {MOSAIC_COLUMNS.map((column, columnIndex) => (
                    <div key={`col-${columnIndex}`} className="mc">
                        {column.map((entry, entryIndex) =>
                            entry.type === "quote" ? (
                                <QuoteCard
                                    key={`entry-${columnIndex}-${entryIndex}`}
                                    quote={entry.quote}
                                    author={entry.author}
                                    isLong={entry.isLong}
                                />
                            ) : (
                                <AchieveImage
                                    key={`entry-${columnIndex}-${entryIndex}`}
                                    filename={entry.filename}
                                    alt={entry.alt}
                                />
                            ),
                        )}
                    </div>
                ))}
            </div>

        </section>
    );
}
