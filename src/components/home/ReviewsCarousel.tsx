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

    // Phones: each card is 85% of the strip so the next one peeks in, and
    // cards keep their own height. Desktop: three cards fill one row at equal
    // height; Swiper sees nothing to scroll and stays still, and a fourth
    // review would make the row swipeable without any change here.
    return (
        <SwipeCarousel
            items={items}
            label={label}
            align="start"
            className="[&>.swiper-wrapper]:items-start lg:mx-auto lg:max-w-[72rem] lg:px-0 lg:[&>.swiper-wrapper]:items-stretch"
            slideClassName="h-auto w-[85%] max-w-[22rem] lg:w-[calc((100%-24px)/3)] lg:max-w-none"
        />
    );
}
