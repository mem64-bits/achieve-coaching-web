import type {Testimonial} from "@constants/results";
import {SwipeCarousel, cardsPerView} from "@/components/common/SwipeCarousel";
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

    // Phones: each card is 85% of the strip so the next one peeks in, and
    // cards keep their own height. From tablets up: the same cards-in-view
    // rule as the photos (2, 3, then 4, never more than there are reviews),
    // all at equal height. With three reviews the row just sits still.
    return (
        <SwipeCarousel
            items={items}
            label={label}
            align="start"
            breakpoints={cardsPerView(testimonials.length)}
            className="[&>.swiper-wrapper]:items-start md:[&>.swiper-wrapper]:items-stretch lg:mx-auto lg:max-w-[72rem] lg:px-0"
            slideClassName="h-auto w-[85%] max-w-[22rem] md:max-w-none"
        />
    );
}
