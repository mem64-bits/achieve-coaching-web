import {readFileSync} from "node:fs";
import {expect, type Locator, type Page} from "@playwright/test";

// Shared helpers for the browser tests.

// The photo files in the order RESULT_PHOTOS lists them, read from the source
// so the tests always check against the real list ("image-20", "image-9", ...).
// The constants file imports images, which Node can't load, so it's parsed.
export function expectedPhotoFiles(): string[] {
    const source = readFileSync("src/constants/resultPhotos.ts", "utf8");
    const files = Object.fromEntries(
        [...source.matchAll(/import (\w+) from "@images\/([\w-]+)\.\w+";/g)].map(([, name, file]) => [name, file]),
    );
    return [...source.matchAll(/\{image: (\w+),/g)].map(([, name]) => files[name]);
}

export const photoCarousel = (page: Page) => page.locator(".swipe-carousel").first();
export const reviewsCarousel = (page: Page) => page.locator(".swipe-carousel").nth(1);

// Scroll a carousel into view and wait for its island to start Swiper.
export async function openCarousel(carousel: Locator) {
    // Centred, so taps and swipes land on it whatever the screen height.
    // Instant: the site scrolls smoothly, and a test measuring mid-scroll
    // would aim at the wrong place.
    await carousel.evaluate((el) => el.scrollIntoView({block: "center", behavior: "instant"}));
    // Sections above render as they come near the screen and the page shifts
    // to keep its place, so wait until the carousel stops moving before
    // anything aims at it. Then centre it again in case it drifted.
    await waitUntilStill(carousel);
    await carousel.evaluate((el) => el.scrollIntoView({block: "center", behavior: "instant"}));
    await waitUntilStill(carousel);
    await expect.poll(() => carousel.evaluate((el) => Boolean((el as SwiperHost).swiper?.initialized))).toBe(true);
    await settle(carousel);
}

// Wait until the element's position on screen has held for a few frames.
async function waitUntilStill(locator: Locator) {
    await locator.evaluate(
        (el) =>
            new Promise<void>((resolve) => {
                let last = NaN;
                let steady = 0;
                const check = () => {
                    const top = el.getBoundingClientRect().top;
                    steady = Math.abs(top - last) < 0.5 ? steady + 1 : 0;
                    last = top;
                    if (steady >= 6) resolve();
                    else requestAnimationFrame(check);
                };
                requestAnimationFrame(check);
            }),
    );
}

// Wait until the carousel has stopped moving.
export async function settle(carousel: Locator) {
    // Done means not moving and resting on a card. A trackpad scroll leaves
    // the strip between cards for a moment before it eases onto one.
    await expect
        .poll(() =>
            carousel.evaluate((el) => {
                const swiper = (el as SwiperHost).swiper;
                const offset = -swiper.translate;
                const onCard = swiper.snapGrid.some((snap) => Math.abs(snap - offset) < 1);
                return !swiper.animating && onCard && !el.dataset.move && !el.dataset.dragging;
            }),
        )
        .toBe(true);
    // Swiper clears `animating` when the move ends; give the frame a moment.
    await carousel.page().waitForTimeout(80);
}

export const cardsAcross = (carousel: Locator) =>
    carousel.evaluate((el) => {
        const perView = (el as SwiperHost).swiper.params.slidesPerView;
        return typeof perView === "number" ? perView : 1;
    });

export interface ShownPhoto {
    index: number;
    file: string;
    loaded: boolean;
}

// The photos actually inside the carousel's visible box, left to right: their
// position in RESULT_PHOTOS, the image file the browser chose, and whether it
// has finished loading.
export function shownPhotos(carousel: Locator): Promise<ShownPhoto[]> {
    return carousel.evaluate((el) => {
        const box = el.getBoundingClientRect();
        return [...el.querySelectorAll<HTMLElement>(".swiper-slide")]
            .map((slide) => ({slide, rect: slide.getBoundingClientRect()}))
            .filter(({rect}) => rect.width > 0 && rect.right > box.left + 2 && rect.left < box.right - 2)
            .sort((a, b) => a.rect.left - b.rect.left)
            .map(({slide}) => {
                const button = slide.querySelector<HTMLElement>("[data-photo-index]");
                const img = slide.querySelector("img");
                const src = decodeURIComponent(img?.currentSrc || img?.src || "");
                return {
                    index: Number(button?.dataset.photoIndex),
                    file: src.match(/image-\d+/)?.[0] ?? src,
                    loaded: Boolean(img?.complete && img.naturalWidth > 0),
                };
            });
    });
}

export const shownIndexes = async (carousel: Locator) => (await shownPhotos(carousel)).map((photo) => photo.index);

// Every visible card has painted a real photo. A blank or single-colour card
// compresses to a tiny PNG; a photo of people doesn't.
export async function expectCardsPainted(carousel: Locator) {
    const slides = carousel.locator(".swiper-slide");
    const count = await slides.count();
    const box = await carousel.boundingBox();
    for (let i = 0; i < count; i += 1) {
        const slide = slides.nth(i);
        const rect = await slide.boundingBox();
        if (!rect || !box || rect.x + rect.width <= box.x + 2 || rect.x >= box.x + box.width - 2) continue;
        const shot = await slide.screenshot({animations: "disabled"});
        expect(shot.byteLength, `card ${i} looks blank`).toBeGreaterThan(8_000);
    }
}

export async function pressNext(page: Page) {
    await page.getByRole("button", {name: "Next photo"}).click();
}

export async function pressPrevious(page: Page) {
    await page.getByRole("button", {name: "Previous photo"}).click();
}

// A finger swipe on touch devices, a mouse drag otherwise, leftwards across
// the middle of the carousel. It covers 60% of one card: a drag slower than
// 300ms only moves on once it passes half a card (Swiper's rule, and what a
// person dragging slowly would see too), and more than a card moves two.
export async function swipeLeft(page: Page, carousel: Locator, touch: boolean) {
    const box = await carousel.boundingBox();
    const card = await carousel.locator(".swiper-slide-active").boundingBox();
    if (!box || !card) throw new Error("carousel not on screen");
    const distance = card.width * 0.6;
    const y = box.y + Math.min(box.height / 2, 200);
    const startX = box.x + box.width / 2 + distance / 2;
    const steps = 10;

    if (touch) {
        // Playwright has no multi-step touch gesture, so this talks to
        // Chrome's input layer directly.
        const cdp = await page.context().newCDPSession(page);
        const send = (type: "touchStart" | "touchMove" | "touchEnd", x: number) =>
            cdp.send("Input.dispatchTouchEvent", {type, touchPoints: type === "touchEnd" ? [] : [{x, y}]});
        await send("touchStart", startX);
        for (let step = 1; step <= steps; step += 1) {
            await send("touchMove", startX - (distance * step) / steps);
            await page.waitForTimeout(16);
        }
        await send("touchEnd", 0);
        await cdp.detach();
    } else {
        await page.mouse.move(startX, y);
        await page.mouse.down();
        for (let step = 1; step <= steps; step += 1) {
            await page.mouse.move(startX - (distance * step) / steps, y);
            await page.waitForTimeout(16);
        }
        await page.mouse.up();
    }
}

export type SwiperHost = HTMLElement & {
    swiper: {
        initialized: boolean;
        animating: boolean;
        activeIndex: number;
        realIndex: number;
        translate: number;
        snapGrid: number[];
        params: {slidesPerView: number | "auto"; loop: boolean};
        slides: HTMLElement[];
    };
};
