import {describe, expect, it} from "vitest";
import {easeOutStartingAt, GLIDE_CURVE_SLOPE, planGlide, releaseVelocity} from "../glide";

// Cards 400px apart: resting positions 0, -400, -800, ...
const snaps = Array.from({length: 10}, (_, i) => -400 * i);
const maxTravel = 1200;

describe("releaseVelocity", () => {
    it("measures the speed over the last stretch of the drag", () => {
        const samples = [0, 16, 32, 48, 64, 80].map((time) => ({time, position: -time * 0.5}));
        expect(releaseVelocity(samples, 82)).toBeCloseTo(-0.5);
    });

    it("ignores the early part of a drag that slowed down", () => {
        const fast = [0, 16, 32].map((time) => ({time, position: -time * 3}));
        const slow = [120, 136, 152, 168, 184, 200].map((time) => ({time, position: -96 - (time - 120) * 0.2}));
        expect(releaseVelocity([...fast, ...slow], 202)).toBeCloseTo(-0.2);
    });

    it("is zero when the finger stopped before letting go", () => {
        const samples = [0, 16, 32].map((time) => ({time, position: -time}));
        expect(releaseVelocity(samples, 200)).toBe(0);
    });

    it("is zero without enough samples", () => {
        expect(releaseVelocity([], 10)).toBe(0);
        expect(releaseVelocity([{time: 0, position: 0}], 5)).toBe(0);
    });
});

describe("planGlide", () => {
    it("settles on the nearest card when let go without moving", () => {
        expect(planGlide({position: -150, velocity: 0, snaps, maxTravel})).toMatchObject({index: 0, duration: 380});
        expect(planGlide({position: -260, velocity: 0, snaps, maxTravel})).toMatchObject({index: 1, duration: 380});
    });

    it("from rest, starts from rest: no jump to full speed when a mouse stops before letting go", () => {
        const plan = planGlide({position: -260, velocity: 0, snaps, maxTravel});
        expect(startingSlope(plan.curve!)).toBe(0);
    });

    it("does nothing when already resting on a card", () => {
        expect(planGlide({position: -800, velocity: 0, snaps, maxTravel})).toEqual({index: 2, duration: 0});
    });

    it("a gentle flick carries on to the next card", () => {
        const plan = planGlide({position: -120, velocity: -1, snaps, maxTravel});
        expect(plan.index).toBe(1);
    });

    it("a hard flick carries several cards, capped by maxTravel", () => {
        expect(planGlide({position: 0, velocity: -8, snaps, maxTravel}).index).toBe(3);
        expect(planGlide({position: 0, velocity: -2.2, snaps, maxTravel}).index).toBe(2);
    });

    it("flicks backwards too", () => {
        expect(planGlide({position: -1700, velocity: 1.2, snaps, maxTravel}).index).toBe(3);
    });

    it("leaves at the finger's speed: the curve's starting speed matches the release", () => {
        const velocity = -1.5;
        const position = -100;
        const plan = planGlide({position, velocity, snaps, maxTravel});
        const distance = Math.abs(snaps[plan.index] - position);
        const startingSpeed = (GLIDE_CURVE_SLOPE * distance) / plan.duration;
        expect(startingSpeed).toBeCloseTo(Math.abs(velocity), 1);
    });

    it("keeps glides between a quick settle and under a second", () => {
        const slow = planGlide({position: -390, velocity: -0.06, snaps, maxTravel});
        const fast = planGlide({position: 0, velocity: -20, snaps, maxTravel});
        expect(slow.duration).toBeGreaterThanOrEqual(220);
        expect(fast.duration).toBeLessThanOrEqual(900);
        expect(fast.duration).toBeGreaterThanOrEqual(220);
    });

    it("matches the stylesheet's curve when the duration didn't need capping", () => {
        const plan = planGlide({position: -100, velocity: -1.5, snaps, maxTravel});
        expect(startingSlope(plan.curve!)).toBeCloseTo(1.84, 1);
    });

    it("still leaves at the finger's speed when a slow glide is capped at the longest duration", () => {
        // 0.36 px/ms with 300px to go would want 1.5s; it's capped, so the
        // curve starts gentler to match the finger rather than jumping ahead.
        const velocity = -0.36;
        const position = -100;
        const plan = planGlide({position, velocity, snaps, maxTravel});
        expect(plan.duration).toBe(900);
        const startingSpeed = (startingSlope(plan.curve!) * Math.abs(snaps[plan.index] - position)) / plan.duration;
        expect(startingSpeed).toBeCloseTo(Math.abs(velocity), 2);
    });

    it("never builds a curve that overshoots the card", () => {
        expect(easeOutStartingAt(9)).toBe("cubic-bezier(0.25, 2.25, 0.45, 0.94)");
        // A huge flick over a short distance is capped at the shortest
        // duration; its curve's first point stays at or below 1.
        const plan = planGlide({position: -390, velocity: -8, snaps, maxTravel: 10});
        expect(startingSlope(plan.curve!) * 0.25).toBeLessThanOrEqual(1);
    });

    it("let go moving away from the nearest card, leans that way a little before settling back", () => {
        const plan = planGlide({position: -390, velocity: 0.06, snaps, maxTravel});
        expect(plan).toMatchObject({index: 1, duration: 380});
        // Negative start: carries on briefly, as a spring would, but capped.
        expect(startingSlope(plan.curve!)).toBe(-1);
    });

    it("copes with a single card", () => {
        expect(planGlide({position: -30, velocity: -3, snaps: [0], maxTravel})).toMatchObject({index: 0, duration: 380});
    });
});

// How many times its average speed a planned curve starts at.
function startingSlope(curve: string): number {
    const [x1, y1] = curve.match(/-?[\d.]+/g)!.map(Number);
    return y1 / x1;
}
