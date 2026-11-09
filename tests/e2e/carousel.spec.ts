import {expect, test} from "@playwright/test";
import {fullCycle, nextBatchStart, visibleWindow} from "../../src/lib/carousel/circular";
import {
    cardsAcross,
    expectCardsPainted,
    expectedPhotoFiles,
    openCarousel,
    photoCarousel,
    pressNext,
    pressPrevious,
    settle,
    shownIndexes,
    shownPhotos,
    swipeLeft,
} from "./helpers";

// The client photo carousel: order, circular stepping, smooth batch moves,
// photos loaded before they arrive, and the viewer opening the right photo.
// Runs at every project width (one card on phones and tablets, three from
// 1024px), with the expected order worked out by the same circular helpers
// the carousel uses.

const files = expectedPhotoFiles();
const total = files.length;

test.beforeEach(async ({page}) => {
    await page.goto("/");
    await openCarousel(photoCarousel(page));
});

test("has one slide per photo and no blank fillers", async ({page}) => {
    const carousel = photoCarousel(page);
    await expect(carousel.locator(".swiper-slide")).toHaveCount(total);
    await expect(carousel.locator(".swiper-slide-blank")).toHaveCount(0);
});

test("every slide shows the photo listed at its position in RESULT_PHOTOS", async ({page}) => {
    const slides = await photoCarousel(page).evaluate((el) =>
        [...el.querySelectorAll<HTMLElement>("[data-photo-index]")].map((button) => {
            const img = button.closest(".swiper-slide")?.querySelector("img");
            return {index: Number(button.dataset.photoIndex), src: decodeURIComponent(img?.getAttribute("src") ?? "")};
        }),
    );
    expect(slides).toHaveLength(total);
    for (const {index, src} of slides) {
        expect(src, `slide for photo ${index + 1}`).toContain(files[index]);
    }
});

test("opens on the first photos in the defined order", async ({page}) => {
    const carousel = photoCarousel(page);
    const perView = await cardsAcross(carousel);
    const shown = await shownPhotos(carousel);

    expect(shown.map((photo) => photo.index)).toEqual(visibleWindow(0, perView, total));
    expect(shown.map((photo) => photo.file)).toEqual(visibleWindow(0, perView, total).map((index) => files[index]));
    expect(shown.every((photo) => photo.loaded)).toBe(true);
});

test("Next goes through every photo in order, a batch at a time, and round again", async ({page}) => {
    const carousel = photoCarousel(page);
    const perView = await cardsAcross(carousel);
    // Twice round the list, so the wrap from the last photo to the first is
    // crossed at least twice, from wherever the batches happen to fall.
    const steps = Math.ceil(total / perView) * 2;
    let first = 0;
    const seen: number[] = [];

    for (let step = 0; step < steps; step += 1) {
        await pressNext(page);
        await settle(carousel);
        first = nextBatchStart(first, perView, total);
        const shown = await shownPhotos(carousel);

        expect(shown.map((photo) => photo.index), `after Next #${step + 1}`).toEqual(visibleWindow(first, perView, total));
        expect(shown.map((photo) => photo.file)).toEqual(shown.map((photo) => files[photo.index]));
        expect(shown.every((photo) => photo.loaded), `photos loaded after Next #${step + 1}`).toBe(true);
        seen.push(...shown.map((photo) => photo.index));
    }

    // Every photo turned up, and the first lap matched the reference order.
    expect(new Set(seen).size).toBe(total);
    expect(fullCycle(nextBatchStart(0, perView, total), perView, total).flat().slice(0, total)).toEqual(
        seen.slice(0, total),
    );
});

test("Previous from the first batch goes round to the end of the list", async ({page}) => {
    const carousel = photoCarousel(page);
    const perView = await cardsAcross(carousel);

    await pressPrevious(page);
    await settle(carousel);
    expect(await shownIndexes(carousel)).toEqual(visibleWindow(total - perView, perView, total));

    await pressPrevious(page);
    await settle(carousel);
    expect(await shownIndexes(carousel)).toEqual(visibleWindow(total - 2 * perView, perView, total));
});

test("forward and back again lands on the same photos", async ({page}) => {
    const carousel = photoCarousel(page);
    const start = await shownIndexes(carousel);

    for (let i = 0; i < 4; i += 1) {
        await pressNext(page);
        await settle(carousel);
    }
    for (let i = 0; i < 4; i += 1) {
        await pressPrevious(page);
        await settle(carousel);
    }
    expect(await shownIndexes(carousel)).toEqual(start);
});

test("arrow keys step a batch like the buttons", async ({page}) => {
    const carousel = photoCarousel(page);
    const perView = await cardsAcross(carousel);

    await carousel.focus();
    await page.keyboard.press("ArrowRight");
    await settle(carousel);
    expect(await shownIndexes(carousel)).toEqual(visibleWindow(perView, perView, total));

    await page.keyboard.press("ArrowLeft");
    await page.keyboard.press("ArrowLeft");
    await settle(carousel);
    expect(await shownIndexes(carousel)).toEqual(visibleWindow(total - perView, perView, total));
});

test("a swipe or drag moves on one photo without opening the viewer", async ({page}, testInfo) => {
    const carousel = photoCarousel(page);
    const perView = await cardsAcross(carousel);

    await swipeLeft(page, carousel, Boolean(testInfo.project.use.hasTouch));
    await settle(carousel);

    expect(await shownIndexes(carousel)).toEqual(visibleWindow(1, perView, total));
    await expect(page.locator("dialog.lightbox[open]")).toHaveCount(0);
});

test("trackpad side-scroll moves the strip; up and down still scroll the page", async ({page}, testInfo) => {
    test.skip(Boolean(testInfo.project.use.hasTouch), "no trackpad on touch devices");
    const carousel = photoCarousel(page);
    const perView = await cardsAcross(carousel);
    const box = await carousel.boundingBox();
    await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);

    // A trackpad flick is a quick burst of small sideways wheel events.
    for (let i = 0; i < 20; i += 1) {
        await page.mouse.wheel(15, 0);
        await page.waitForTimeout(16);
    }
    await settle(carousel);
    expect(await shownIndexes(carousel)).toEqual(visibleWindow(1, perView, total));

    const before = await page.evaluate(() => scrollY);
    await page.mouse.wheel(0, 300);
    await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(before + 100);
});

test("a batch move glides: the strip passes through many in-between positions", async ({page}) => {
    const carousel = photoCarousel(page);
    // Record the strip's position on every animation frame of one move.
    const frames = carousel.evaluate(
        (el) =>
            new Promise<number[]>((resolve) => {
                const wrapper = el.querySelector(".swiper-wrapper")!;
                const positions: number[] = [];
                const startedAt = performance.now();
                const sample = () => {
                    positions.push(new DOMMatrixReadOnly(getComputedStyle(wrapper).transform).m41);
                    if (performance.now() - startedAt < 1100) requestAnimationFrame(sample);
                    else resolve(positions);
                };
                requestAnimationFrame(sample);
            }),
    );
    await pressNext(page);
    const positions = await frames;

    const distinct = [...new Set(positions.map((x) => Math.round(x)))];
    expect(distinct.length, "in-between positions").toBeGreaterThan(8);
    // Always moving the same way: no jumps back while it glides.
    for (let i = 1; i < positions.length; i += 1) {
        expect(positions[i]).toBeLessThanOrEqual(positions[i - 1] + 0.5);
    }
});

// Letting go of a drag should feel like iOS and Android: the strip carries
// on at the speed the finger was moving, slows down, and stops on a card.
// Before, Swiper's release jumped to about twice the drag speed.
for (const pixelsPerFrame of [6, 15, 25]) {
    test(`letting go of a ${pixelsPerFrame}px-a-frame drag carries on at that speed and stops on a card`, async ({page}) => {
        const carousel = photoCarousel(page);
        // Drive the drag from inside the page, one pointer move per frame, so
        // the speed is exact, and note where the strip is on every frame.
        const run = await carousel.evaluate(
            (el, speed) =>
                new Promise<{speeds: number[]; fingerSpeed: number; releasedAt: number}>((resolve) => {
                    const wrapper = el.querySelector(".swiper-wrapper")!;
                    const target = el.querySelector(".swiper-slide-active img") ?? wrapper;
                    const box = el.getBoundingClientRect();
                    const y = box.top + box.height * 0.4;
                    let x = box.left + box.width * 0.6;
                    const send = (type: string) =>
                        target.dispatchEvent(
                            new PointerEvent(type, {
                                bubbles: true,
                                cancelable: true,
                                clientX: x,
                                clientY: y,
                                pointerId: 1,
                                pointerType: "mouse",
                                isPrimary: true,
                                button: 0,
                                buttons: type === "pointerup" ? 0 : 1,
                            }),
                        );
                    const read = () => new DOMMatrixReadOnly(getComputedStyle(wrapper).transform).m41;
                    // Position and time on each frame, so the speeds are per
                    // millisecond and a slow frame on a busy machine doesn't
                    // look like a lurch.
                    const positions: number[] = [];
                    const times: number[] = [];
                    const dragFrames = 14;
                    let releasedAt = -1;
                    send("pointerdown");
                    const frame = (time: number) => {
                        positions.push(read());
                        times.push(time);
                        if (positions.length <= dragFrames) {
                            x -= speed;
                            send("pointermove");
                        } else if (releasedAt < 0) {
                            send("pointerup");
                            releasedAt = positions.length;
                        }
                        if (positions.length < dragFrames + 80) requestAnimationFrame(frame);
                        else {
                            const speeds = positions.slice(1).map((p, i) => (p - positions[i]) / (times[i + 1] - times[i]));
                            const fingerSpeed = (speed * dragFrames) / (times[dragFrames] - times[0]);
                            resolve({speeds, fingerSpeed, releasedAt});
                        }
                    };
                    requestAnimationFrame(frame);
                }),
            pixelsPerFrame,
        );

        // A short, slow drag eases back to the card it started on, like a
        // phone does; anything else carries on. Either way the strip picks
        // one direction and keeps it until it stops.
        const glide = run.speeds.slice(run.releasedAt).filter((speed) => Math.abs(speed) > 0.015);
        const direction = Math.sign(glide[0] ?? 0);
        for (const speed of glide) expect(Math.sign(speed)).toBe(direction);
        if (direction < 0) {
            // Carrying on: no faster than the finger, give or take. Before
            // the fix this came out at about twice the finger's speed.
            for (const speed of glide.slice(0, 3)) {
                expect(Math.abs(speed)).toBeLessThanOrEqual(run.fingerSpeed * 1.4 + 0.05);
            }
        }
        // It only ever slows down: no lurch partway through.
        const speeds = glide.map(Math.abs);
        for (let i = 1; i < speeds.length; i += 1) expect(speeds[i]).toBeLessThanOrEqual(speeds[i - 1] * 1.2 + 0.05);
        await settle(carousel);
    });
}

test("the photos either side are loaded before they're needed, even on a slow connection", async ({page, browserName}) => {
    test.skip(browserName !== "chromium", "network throttling needs Chrome");
    const carousel = photoCarousel(page);
    const perView = await cardsAcross(carousel);

    // Without touching anything, the next and previous batches should load.
    const ready = (indexes: number[]) =>
        carousel.evaluate(
            (el, wanted) =>
                wanted.every((index) => {
                    const img = el.querySelector<HTMLImageElement>(`.swiper-slide:has([data-photo-index="${index}"]) img`);
                    return Boolean(img?.complete && img.naturalWidth > 0);
                }),
            indexes,
        );
    await expect.poll(() => ready(visibleWindow(perView, perView, total))).toBe(true);
    await expect.poll(() => ready(visibleWindow(total - perView, perView, total))).toBe(true);

    // Now on a slow phone connection, step and check the incoming photos are
    // already there the moment they start sliding in.
    const cdp = await page.context().newCDPSession(page);
    await cdp.send("Network.emulateNetworkConditions", {
        offline: false,
        latency: 150,
        downloadThroughput: (400 * 1024) / 8,
        uploadThroughput: (200 * 1024) / 8,
    });
    for (let step = 1; step <= 4; step += 1) {
        await pressNext(page);
        await page.waitForTimeout(60);
        const incoming = visibleWindow(step * perView, perView, total);
        expect(await ready(incoming), `batch ${step + 1} ready as it slides in`).toBe(true);
        await settle(carousel);
        // And the batch after it gets fetched while this one is on screen.
        await expect.poll(() => ready(visibleWindow((step + 1) * perView, perView, total)), {timeout: 20_000}).toBe(true);
    }
});

test("cards on screen have painted their photos at every step", async ({page}) => {
    const carousel = photoCarousel(page);
    const perView = await cardsAcross(carousel);
    const laps = Math.ceil(total / perView);

    await expectCardsPainted(carousel);
    for (let step = 0; step < laps; step += 1) {
        await pressNext(page);
        await settle(carousel);
        await expectCardsPainted(carousel);
    }
});

test("tapping a photo opens the viewer on that photo, also after going round the end", async ({page}) => {
    const carousel = photoCarousel(page);
    await pressPrevious(page);
    await settle(carousel);

    const [first] = await shownPhotos(carousel);
    await carousel.locator(`[data-photo-index="${first.index}"]`).click();

    const viewer = page.locator("dialog.lightbox[open]");
    await expect(viewer).toHaveCount(1);
    await expect
        .poll(() => viewer.evaluate((el) => (el.querySelector(".swiper") as HTMLElement & {swiper?: {activeIndex: number}})?.swiper?.activeIndex))
        .toBe(first.index);
    const shownFile = await viewer.locator(".swiper-slide-active img").evaluate((img: HTMLImageElement) =>
        decodeURIComponent(img.currentSrc || img.src),
    );
    expect(shownFile).toContain(files[first.index]);

    await page.keyboard.press("Escape");
    await expect(viewer).toHaveCount(0);
    // Closing the viewer leaves the strip where it was.
    expect((await shownPhotos(carousel))[0].index).toBe(first.index);
});

test("with reduced motion a batch step happens at once", async ({page}) => {
    await page.emulateMedia({reducedMotion: "reduce"});
    await page.reload();
    const carousel = photoCarousel(page);
    await openCarousel(carousel);
    const perView = await cardsAcross(carousel);

    await pressNext(page);
    // No settle: there should be nothing to wait for.
    await page.waitForTimeout(50);
    expect(await shownIndexes(carousel)).toEqual(visibleWindow(perView, perView, total));
});

test("resizing between phone and desktop keeps the order and the place", async ({page}, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "only needs one run");
    const carousel = photoCarousel(page);

    await pressNext(page);
    await settle(carousel);
    expect(await shownIndexes(carousel)).toEqual([3, 4, 5]);

    await page.setViewportSize({width: 412, height: 839});
    await settle(carousel);
    expect(await shownIndexes(carousel)).toEqual([3]);

    await pressNext(page);
    await settle(carousel);
    expect(await shownIndexes(carousel)).toEqual([4]);

    await page.setViewportSize({width: 1440, height: 900});
    await settle(carousel);
    expect(await shownIndexes(carousel)).toEqual([4, 5, 6]);
});

// Browsing on a computer: the photo itself is for dragging, only the
// View full size button opens the viewer. On touch screens a tap anywhere on
// the photo still opens it.
const usesFinePointer = (page: import("@playwright/test").Page) =>
    page.evaluate(() => matchMedia("(pointer: fine)").matches);

test("on a computer, clicking a photo doesn't open the viewer; View full size does", async ({page}) => {
    test.skip(!(await usesFinePointer(page)), "touch screens open the viewer with a tap");
    const carousel = photoCarousel(page);
    const viewer = page.locator("dialog.lightbox[open]");
    const [first] = await shownPhotos(carousel);
    const photo = carousel.locator(".swiper-slide-active img");

    // Middle of the photo, then near its top-left corner.
    await photo.click();
    await photo.click({position: {x: 20, y: 20}});
    await page.waitForTimeout(400);
    await expect(viewer).toHaveCount(0);

    await carousel.locator(`[data-photo-index="${first.index}"]`).click();
    await expect(viewer).toHaveCount(1);
});

test("on a computer, repeated drags step through the photos in order and never open the viewer", async ({page}) => {
    test.skip(!(await usesFinePointer(page)), "covered by the swipe test on touch screens");
    const carousel = photoCarousel(page);
    const perView = await cardsAcross(carousel);

    for (let drag = 1; drag <= 6; drag += 1) {
        await swipeLeft(page, carousel, false);
        await settle(carousel);
        expect(await shownIndexes(carousel), `after drag ${drag}`).toEqual(visibleWindow(drag, perView, total));
        await expect(page.locator("dialog.lightbox[open]")).toHaveCount(0);
    }
});

test("on a touch screen, tapping anywhere on the photo opens the viewer", async ({page}) => {
    test.skip(await usesFinePointer(page), "computers use the View full size button");
    const carousel = photoCarousel(page);
    const [first] = await shownPhotos(carousel);

    // On touch screens the View full size button covers the whole card, so
    // tapping it near the photo's top-left corner is tapping the photo.
    await carousel.locator(`[data-photo-index="${first.index}"]`).tap({position: {x: 30, y: 30}});
    const viewer = page.locator("dialog.lightbox[open]");
    await expect(viewer).toHaveCount(1);
    await expect
        .poll(() => viewer.evaluate((el) => (el.querySelector(".swiper") as HTMLElement & {swiper?: {activeIndex: number}})?.swiper?.activeIndex))
        .toBe(first.index);
});

test("the arrows sit beside the photos on wide screens and under them on smaller ones", async ({page}) => {
    const carousel = photoCarousel(page);
    const strip = (await carousel.boundingBox())!;
    const next = (await page.getByRole("button", {name: "Next photo"}).boundingBox())!;
    const previous = (await page.getByRole("button", {name: "Previous photo"}).boundingBox())!;
    const wide = (page.viewportSize()?.width ?? 0) >= 1024;

    if (wide) {
        const middle = strip.y + strip.height / 2;
        for (const arrow of [next, previous]) {
            expect(Math.abs(arrow.y + arrow.height / 2 - middle)).toBeLessThan(20);
        }
        expect(previous.x).toBeLessThan(strip.x + 80);
        expect(next.x + next.width).toBeGreaterThan(strip.x + strip.width - 80);
    } else {
        expect(next.y).toBeGreaterThanOrEqual(strip.y + strip.height - 2);
    }
});

