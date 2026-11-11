import {expect, test} from "@playwright/test";
import {nextBatchStart, visibleWindow} from "../../src/lib/carousel/circular";
import {cardsAcross, expectedPhotoFiles, openCarousel, photoCarousel, pressNext, pressPrevious, settle, shownIndexes, shownPhotos} from "./helpers";

const total = expectedPhotoFiles().length;

test.beforeEach(async ({page}) => {
    await page.goto("/lab/spring-glide/");
    await openCarousel(photoCarousel(page));
});

test("spring: Next goes through every photo in order and round again", async ({page}) => {
    const carousel = photoCarousel(page);
    const perView = await cardsAcross(carousel);
    let first = 0;
    for (let step = 0; step < Math.ceil(total / perView) + 1; step += 1) {
        await pressNext(page);
        await settle(carousel);
        first = nextBatchStart(first, perView, total);
        expect(await shownIndexes(carousel), `after Next #${step + 1}`).toEqual(visibleWindow(first, perView, total));
    }
});

test("spring: Previous from the start goes round to the end", async ({page}) => {
    const carousel = photoCarousel(page);
    const perView = await cardsAcross(carousel);
    await pressPrevious(page);
    await settle(carousel);
    expect(await shownIndexes(carousel)).toEqual(visibleWindow(total - perView, perView, total));
});

test("spring: quick presses all count and chain into one smooth move", async ({page}) => {
    const carousel = photoCarousel(page);
    const perView = await cardsAcross(carousel);
    const trace = carousel.evaluate(
        (el) =>
            new Promise<number[]>((resolve) => {
                const wrapper = el.querySelector(".swiper-wrapper")!;
                const positions: number[] = [];
                const sample = () => {
                    positions.push(new DOMMatrixReadOnly(getComputedStyle(wrapper).transform).m41);
                    if (positions.length < 90) requestAnimationFrame(sample);
                    else resolve(positions);
                };
                requestAnimationFrame(sample);
            }),
    );
    await pressNext(page);
    await page.waitForTimeout(150);
    await pressNext(page);
    await page.waitForTimeout(150);
    await pressNext(page);
    const positions = await trace;
    await settle(carousel);
    expect(await shownIndexes(carousel)).toEqual(visibleWindow(3 * perView, perView, total));

    const steps = positions.slice(1).map((x, i) => x - positions[i]);
    for (const step of steps) expect(step).toBeLessThanOrEqual(0.5);
});

test("spring: letting go carries on at the hand's speed, and a click mid-glide settles on a card", async ({page}, testInfo) => {
    test.skip(Boolean(testInfo.project.use.hasTouch), "mouse");
    const carousel = photoCarousel(page);
    const run = await carousel.evaluate(
        (el) =>
            new Promise<{speeds: number[]; releasedAt: number; handSpeed: number}>((resolve) => {
                const wrapper = el.querySelector(".swiper-wrapper")!;
                const box = el.getBoundingClientRect();
                const y = box.top + box.height * 0.4;
                let x = box.left + box.width * 0.8;
                const target = el.querySelector(".swiper-slide-active img") ?? el;
                const send = (type: string) =>
                    target.dispatchEvent(
                        new PointerEvent(type, {bubbles: true, cancelable: true, clientX: x, clientY: y, pointerId: 1, pointerType: "mouse", isPrimary: true, button: 0, buttons: type === "pointerup" ? 0 : 1}),
                    );
                const positions: number[] = [];
                const times: number[] = [];
                const dragFrames = 12;
                let releasedAt = -1;
                send("pointerdown");
                const frame = (time: number) => {
                    positions.push(new DOMMatrixReadOnly(getComputedStyle(wrapper).transform).m41);
                    times.push(time);
                    if (positions.length <= dragFrames) {
                        x -= 18;
                        send("pointermove");
                    } else if (releasedAt < 0) {
                        send("pointerup");
                        releasedAt = positions.length;
                    } else if (positions.length === releasedAt + 5) {
                        send("pointerdown");
                        send("pointerup");
                    }
                    if (positions.length < releasedAt + 8 || releasedAt < 0) requestAnimationFrame(frame);
                    else {
                        const speeds = positions.slice(1).map((p, i) => (p - positions[i]) / (times[i + 1] - times[i]));
                        resolve({speeds, releasedAt, handSpeed: (18 * dragFrames) / (times[dragFrames] - times[0])});
                    }
                };
                requestAnimationFrame(frame);
            }),
    );
    const afterRelease = run.speeds.slice(run.releasedAt, run.releasedAt + 3);
    for (const speed of afterRelease) {
        expect(speed).toBeLessThan(0);
        expect(Math.abs(speed)).toBeLessThanOrEqual(run.handSpeed * 1.4 + 0.05);
    }
    await settle(carousel);
});

test("spring: with reduced motion a batch step still happens at once", async ({page}) => {
    await page.emulateMedia({reducedMotion: "reduce"});
    await page.reload();
    const carousel = photoCarousel(page);
    await openCarousel(carousel);
    const perView = await cardsAcross(carousel);
    await pressNext(page);
    await page.waitForTimeout(50);
    expect(await shownIndexes(carousel)).toEqual(visibleWindow(perView, perView, total));
});

test("spring: photos on screen are the ones listed at those positions", async ({page}) => {
    const carousel = photoCarousel(page);
    await pressNext(page);
    await settle(carousel);
    const files = expectedPhotoFiles();
    const shown = await shownPhotos(carousel);
    expect(shown.map((photo) => photo.file)).toEqual(shown.map((photo) => files[photo.index]));
});
