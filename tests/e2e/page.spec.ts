import AxeBuilder from "@axe-core/playwright";
import {expect, test} from "@playwright/test";
import {visibleWindow} from "../../src/lib/carousel/circular";
import {TESTIMONIALS} from "../../src/constants/results";
import {cardsAcross, openCarousel, photoCarousel, reviewsCarousel, settle, swipeLeft} from "./helpers";

// The rest of the home page around the carousels: reviews, layout, header
// links and accessibility.

test.describe("reviews", () => {
    test.beforeEach(async ({page}) => {
        await page.goto("/");
        await openCarousel(reviewsCarousel(page));
    });

    test("are in the order TESTIMONIALS lists them, first one first", async ({page}) => {
        const carousel = reviewsCarousel(page);
        const perView = await cardsAcross(carousel);
        const names = await carousel.locator(".swiper-slide figcaption").allInnerTexts();

        expect(names.map((name) => name.split(",")[0].trim())).toEqual(TESTIMONIALS.map((review) => review.name.toUpperCase()));
        const shown = await carousel.evaluate((el) => {
            const box = el.getBoundingClientRect();
            return [...el.querySelectorAll(".swiper-slide")]
                .map((slide, index) => ({index, rect: slide.getBoundingClientRect()}))
                .filter(({rect}) => rect.right > box.left + 2 && rect.left < box.right - 2)
                .map(({index}) => index);
        });
        expect(shown).toEqual(visibleWindow(0, Math.min(perView, TESTIMONIALS.length), TESTIMONIALS.length));
    });

    test("don't loop: there are too few to go round", async ({page}) => {
        const loops = await reviewsCarousel(page).evaluate((el) => (el as HTMLElement & {swiper: {params: {loop: boolean}}}).swiper.params.loop);
        expect(loops).toBe(false);
    });

    test("one at a time on phones and tablets, swiping to the next", async ({page}, testInfo) => {
        const carousel = reviewsCarousel(page);
        test.skip((await cardsAcross(carousel)) > 1, "all three fit on wide screens");

        await swipeLeft(page, carousel, Boolean(testInfo.project.use.hasTouch));
        await settle(carousel);
        const active = await carousel.evaluate((el) => (el as HTMLElement & {swiper: {activeIndex: number}}).swiper.activeIndex);
        expect(active).toBe(1);
    });
});

test.describe("layout", () => {
    test("nothing scrolls sideways", async ({page}) => {
        await page.goto("/");
        await openCarousel(photoCarousel(page));
        await openCarousel(reviewsCarousel(page));
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        expect(overflow).toBeLessThanOrEqual(0);
    });

    test("header links land each section just under the header", async ({page}) => {
        await page.goto("/");
        const header = page.locator("header").first();

        for (const id of ["results", "reviews", "contact", "results"]) {
            await page.locator(`header a[href="#${id}"]`).filter({visible: true}).first().click();
            await expect
                .poll(async () => {
                    const headerBottom = (await header.boundingBox())!.height;
                    const top = await page.locator(`#${id}`).evaluate((el) => el.getBoundingClientRect().top);
                    const atBottom = await page.evaluate(() => innerHeight + scrollY >= document.documentElement.scrollHeight - 4);
                    // The footer (contact) is short, so the page can't scroll it
                    // all the way up; it just needs to be in view.
                    return atBottom ? top < innerHeightOf(page) : top >= headerBottom - 2 && top <= headerBottom + 40;
                })
                .toBe(true);
        }
    });

    test("console stays free of errors while using the carousels", async ({page}) => {
        const problems: string[] = [];
        page.on("pageerror", (error) => problems.push(error.message));
        page.on("console", (message) => {
            if (message.type() === "error") problems.push(message.text());
        });
        await page.goto("/");
        const carousel = photoCarousel(page);
        await openCarousel(carousel);
        for (let i = 0; i < 10; i += 1) {
            await page.getByRole("button", {name: "Next photo"}).click();
            await settle(carousel);
        }
        await openCarousel(reviewsCarousel(page));
        expect(problems).toEqual([]);
    });
});

test("passes an accessibility scan with both carousels running", async ({page}) => {
    await page.goto("/");
    await openCarousel(photoCarousel(page));
    await openCarousel(reviewsCarousel(page));
    // @axe-core/playwright is typed against a slightly older Playwright Page;
    // the object is the same at runtime, so this only quiets the types.
    const axePage = page as unknown as ConstructorParameters<typeof AxeBuilder>[0]["page"];
    const results = await new AxeBuilder({page: axePage}).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa", "best-practice"]).analyze();
    expect(results.violations.map((violation) => `${violation.id}: ${violation.nodes.length}`)).toEqual([]);
});

function innerHeightOf(page: import("@playwright/test").Page): number {
    return page.viewportSize()?.height ?? 0;
}
