import {createElement} from "react";
import {renderToString} from "react-dom/server";
import {describe, expect, it} from "vitest";
import ResultsGallery from "../ResultsGallery";
import {TESTIMONIALS} from "@constants/results";
import ReviewsCarousel from "@/components/home/ReviewsCarousel";
import type {GalleryPhoto} from "@/types/results";
import type {ResponsiveImage} from "@/types/images";

// The carousels must show their items in the order the constants list them,
// starting with the first. These render the islands to HTML (as Astro does
// on the server) and read the order back out of the markup.
//
// They can't see what Swiper does once it starts in the browser (loop mode,
// for one, rearranges slides only then); tests/e2e/carousel.spec.ts covers
// that, including going round the end of the list.

function fakeImage(src: string): ResponsiveImage {
    return {src, srcSet: `${src} 480w`, sizes: "100vw", width: 480, height: 640, alt: src, sources: []};
}

function fakePhotos(count: number): GalleryPhoto[] {
    return Array.from({length: count}, (_, index) => ({
        id: `result-${index + 1}`,
        aspectRatio: 0.75,
        showWhole: false,
        kind: "transformation",
        thumb: fakeImage(`/photo-${index + 1}.jpg`),
        full: fakeImage(`/photo-${index + 1}-full.jpg`),
    }));
}

// Every `src="..."` in the markup, in the order it appears.
function imageSources(html: string): string[] {
    return [...html.matchAll(/\ssrc="([^"]+)"/g)].map((match) => match[1]);
}

describe("results gallery order", () => {
    it("lists every photo once, in the order it was given, starting with the first", () => {
        const photos = fakePhotos(23);
        const html = renderToString(createElement(ResultsGallery, {photos}));

        expect(imageSources(html)).toEqual(photos.map((photo) => photo.thumb.src));
    });
});

describe("reviews order", () => {
    it("shows the reviews in the order TESTIMONIALS lists them", () => {
        const html = renderToString(createElement(ReviewsCarousel, {testimonials: TESTIMONIALS, label: "In their words"}));
        const positions = TESTIMONIALS.map((testimonial) => html.indexOf(testimonial.name));

        expect(positions.every((position) => position >= 0)).toBe(true);
        expect([...positions].sort((a, b) => a - b)).toEqual(positions);
    });
});
