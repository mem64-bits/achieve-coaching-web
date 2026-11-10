import {expect, test, type Page} from "@playwright/test";
import {openCarousel, photoCarousel} from "./helpers";

// What a photo card does under the pointer. The live page has no hover
// effect for now; /lab/photo-reveal tries "reveal" (zoom out to the whole
// photo). Pointer hover only, so computer-sized projects only.

test.skip(({hasTouch}) => hasTouch, "no hover on touch screens");

// The scale of the photo under the middle of the strip, and whether it's a
// "reveal" photo (one that isn't the card's shape).
async function hoverMiddlePhoto(page: Page) {
    const carousel = photoCarousel(page);
    await openCarousel(carousel);
    const box = (await carousel.boundingBox())!;
    const point = {x: box.x + box.width / 2, y: box.y + box.height * 0.3};
    const read = () =>
        page.evaluate(({x, y}) => {
            const img = document.elementsFromPoint(x, y).find((el) => el.tagName === "IMG") as HTMLImageElement;
            return {reveal: img.classList.contains("photo-reveal"), scale: getComputedStyle(img).scale};
        }, point);
    await page.mouse.move(5, 5);
    const before = await read();
    await page.mouse.move(point.x, point.y);
    await page.waitForTimeout(800);
    return {before, after: await read()};
}

test("live page: hovering a photo leaves it as it is", async ({page}) => {
    await page.goto("/");
    const {before, after} = await hoverMiddlePhoto(page);
    expect(after.scale).toBe(before.scale);
});

test("lab page: hovering a cropped photo zooms out to show it whole", async ({page}) => {
    await page.goto("/lab/photo-reveal/");
    const {before, after} = await hoverMiddlePhoto(page);
    // The second photo is a square before/after pair, cropped at rest.
    expect(before.reveal).toBe(true);
    expect(Number(before.scale)).toBeGreaterThan(1.2);
    expect(after.scale).toBe("1");
});

test("lab page is kept out of search", async ({page}) => {
    await page.goto("/lab/photo-reveal/");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex");
});
