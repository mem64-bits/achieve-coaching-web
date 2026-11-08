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

    // Each card is 85% of the strip so the next one peeks in, as on a phone.
    // Cards keep their own height rather than stretching to the tallest.
    return (
        <SwipeCarousel
            items={items}
            label={label}
            align="start"
            className="[&>.swiper-wrapper]:items-start"
            slideClassName="h-auto w-[85%]"
        />
    );
}
