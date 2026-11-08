import type {Testimonial} from "@constants/results";
import {SwipeCarousel} from "@/components/common/SwipeCarousel";
import {QuoteCard} from "./QuoteCard";

interface ReviewsCarouselProps {
    testimonials: Testimonial[];
    label: string;
}

// The "In their words" cards. A small island of its own because Astro can't
// hand React elements to an island, only data, so the cards are built here.
export default function ReviewsCarousel({testimonials, label}: ReviewsCarouselProps) {
    const items = testimonials.map((testimonial) => ({
        key: testimonial.name,
        content: <QuoteCard {...testimonial}/>,
    }));

    // One card at a time on phones and tablets (capped at 32rem), three in a
    // coverflow from 1024px
    // (see SwipeCarousel). Three reviews are too few to loop, so the row
    // opens on the middle one with the other two either side. Cards stretch
    // to the tallest so the row lines up.
    return (
        <SwipeCarousel
            items={items}
            label={label}
            dimSides={false}
            className="mx-auto max-w-[32rem] lg:max-w-[72rem] [&>.swiper-wrapper]:items-stretch"
            slideClassName="h-auto"
        />
    );
}
