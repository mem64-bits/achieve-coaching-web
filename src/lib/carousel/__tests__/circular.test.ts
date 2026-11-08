import {describe, expect, it} from "vitest";
import {fullCycle, itemsToPreload, nextBatchStart, visibleWindow, wrapIndex} from "../circular";

describe("wrapIndex", () => {
    it("leaves positions inside the list alone", () => {
        expect(wrapIndex(0, 23)).toBe(0);
        expect(wrapIndex(22, 23)).toBe(22);
    });

    it("wraps past the end back to the start", () => {
        expect(wrapIndex(23, 23)).toBe(0);
        expect(wrapIndex(25, 23)).toBe(2);
        expect(wrapIndex(46, 23)).toBe(0);
    });

    it("wraps before the start round to the end", () => {
        expect(wrapIndex(-1, 23)).toBe(22);
        expect(wrapIndex(-3, 23)).toBe(20);
        expect(wrapIndex(-24, 23)).toBe(22);
    });

    it("treats an empty list as position 0", () => {
        expect(wrapIndex(5, 0)).toBe(0);
    });
});

describe("visibleWindow", () => {
    it("shows the batch in list order", () => {
        expect(visibleWindow(0, 3, 23)).toEqual([0, 1, 2]);
        expect(visibleWindow(9, 3, 23)).toEqual([9, 10, 11]);
    });

    it("carries on round the end of the list", () => {
        expect(visibleWindow(21, 3, 23)).toEqual([21, 22, 0]);
        expect(visibleWindow(22, 3, 23)).toEqual([22, 0, 1]);
    });

    it("shows one at a time on phones", () => {
        expect(visibleWindow(22, 1, 23)).toEqual([22]);
    });

    it("never shows more items than there are", () => {
        expect(visibleWindow(0, 3, 2)).toEqual([0, 1]);
    });
});

describe("nextBatchStart", () => {
    it("steps forward a whole batch", () => {
        expect(nextBatchStart(0, 3, 23)).toBe(3);
        expect(nextBatchStart(18, 3, 23)).toBe(21);
    });

    it("steps forward past the end", () => {
        expect(nextBatchStart(21, 3, 23)).toBe(1);
    });

    it("steps back past the start", () => {
        expect(nextBatchStart(0, 3, 23, -1)).toBe(20);
        expect(nextBatchStart(1, 1, 23, -1)).toBe(0);
        expect(nextBatchStart(0, 1, 23, -1)).toBe(22);
    });

    it("forward then back returns to the same batch", () => {
        for (let first = 0; first < 23; first += 1) {
            expect(nextBatchStart(nextBatchStart(first, 3, 23), 3, 23, -1)).toBe(first);
        }
    });
});

describe("itemsToPreload", () => {
    it("covers the batch on screen and one batch either side", () => {
        expect([...itemsToPreload(3, 3, 23)].sort((a, b) => a - b)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
    });

    it("wraps round at the start of the list", () => {
        expect([...itemsToPreload(0, 3, 23)].sort((a, b) => a - b)).toEqual([0, 1, 2, 3, 4, 5, 20, 21, 22]);
    });

    it("is just the neighbours on phones", () => {
        expect([...itemsToPreload(0, 1, 23)].sort((a, b) => a - b)).toEqual([0, 1, 22]);
    });

    it("covers everything for short lists without repeats", () => {
        expect([...itemsToPreload(0, 3, 5)].sort((a, b) => a - b)).toEqual([0, 1, 2, 3, 4]);
    });
});

describe("fullCycle", () => {
    it("shows every photo once, in list order, three at a time", () => {
        const batches = fullCycle(0, 3, 23);
        expect(batches.flat().slice(0, 23)).toEqual(Array.from({length: 23}, (_, index) => index));
        expect(batches.at(-1)).toEqual([21, 22, 0]);
        expect(batches).toHaveLength(8);
    });

    it("shows every photo once, in list order, one at a time", () => {
        expect(fullCycle(0, 1, 23).flat()).toEqual(Array.from({length: 23}, (_, index) => index));
    });

    it("works from any starting point", () => {
        const order = fullCycle(10, 3, 23).flat().slice(0, 23);
        expect(order[0]).toBe(10);
        expect(new Set(order).size).toBe(23);
        order.forEach((index, step) => expect(index).toBe((10 + step) % 23));
    });
});
