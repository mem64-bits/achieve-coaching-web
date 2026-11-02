export interface Testimonial {
    quote: string;
    name: string;
    age?: number;
}

export const RESULTS_SECTION = {
    eyebrow: "Client results",
    titleStart: "Real clients.",
    titleAccent: "Real results.",
    hint: "Tap any photo to see it full screen.",
    testimonialsTitle: "In their words",
};

export const GALLERY_LABELS = {
    transformationBadge: "Before / After",
    openPhoto: (position: number, total: number) => `Open full screen, photo ${position} of ${total}`,
    previous: "Previous photo",
    next: "Next photo",
    close: "Close photo viewer",
    dialogLabel: "Client results photo viewer",
    counter: (position: number, total: number) => `${position} / ${total}`,
};

export const TESTIMONIALS: Testimonial[] = [
    {
        quote: "I’ve seen more progress in these 4 months than I did over the last ten years on my own.",
        name: "Maneesh",
        age: 36,
    },
    {
        quote: "I could clearly feel I was stronger, more energetic and fitter overall. Highly recommend if you want to fall in love with the gym 🙂",
        name: "Sofya T.",
        age: 29,
    },
    {
        quote: "After not seeing much progress for a while, Bobby helped me see improvements again. He created a new training program and diet tailored to my schedule. he’s always great at motivating me to push harder. Over the 3 months , I significantly reduced my body fat and increased muscle.",
        name: "Y.Rey",
        age: 43,
    },
];
