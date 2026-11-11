import {describe, expect, it} from "vitest";
import {isSettled, omegaForGlide, omegaForSettleTime, smoothStepAt, springAt} from "../spring";
import {SpringDriver} from "../SpringDriver";

const settle = omegaForSettleTime(450);
const stiffness = {atRest: settle, quickest: omegaForSettleTime(250), slowest: omegaForSettleTime(1400)};

function trace(offset: number, velocity: number, omega: number): number[] {
    const out: number[] = [];
    for (let t = 0; t <= 1000; t += 16) out.push(springAt({offset, velocity}, omega, t).offset);
    return out;
}

describe("springAt", () => {
    it("starts exactly where and as fast as it's given", () => {
        const start = {offset: -300, velocity: 1.2};
        const now = springAt(start, settle, 0);
        expect(now.offset).toBeCloseTo(-300);
        expect(now.velocity).toBeCloseTo(1.2);
    });

    it("from rest, picks up speed gently, then settles without overshooting", () => {
        const offsets = trace(-200, 0, settle);
        const speeds = offsets.slice(1).map((x, i) => x - offsets[i]);
        expect(Math.abs(speeds[0])).toBeLessThan(Math.max(...speeds.map(Math.abs)) * 0.5);
        for (const x of offsets) expect(x).toBeLessThanOrEqual(0.001);
        expect(isSettled(springAt({offset: -200, velocity: 0}, settle, 450))).toBe(false);
        expect(Math.abs(springAt({offset: -200, velocity: 0}, settle, 450).offset)).toBeLessThan(2.5);
    });

    it("is the same however the time is sliced: 60Hz, 144Hz or a dropped frame", () => {
        const positionAfter = (frameMs: number, frames: number) => {
            const clock = fakeScheduler();
            let last = 0;
            const driver = new SpringDriver((x) => (last = x), clock);
            driver.go(0, -1.5, {target: -400, omega: settle});
            for (let i = 0; i < frames; i += 1) clock.frame(frameMs);
            return last;
        };
        const at60 = positionAfter(16, 15);
        const at144 = positionAfter(6, 40);
        const dropped = positionAfter(48, 5);
        expect(at144).toBeCloseTo(at60, 6);
        expect(dropped).toBeCloseTo(at60, 6);
    });
});

describe("omegaForGlide", () => {
    it("never pulls the strip faster than the hand let go of it", () => {
        for (const [offset, velocity] of [
            [-600, 1.5],
            [-300, 0.6],
            [-900, 2.4],
            [-150, 0.4],
        ]) {
            const omega = omegaForGlide(offset, velocity, stiffness);
            const offsets = trace(offset, velocity, omega);
            const speeds = offsets.slice(1).map((x, i) => (x - offsets[i]) / 16);
            const fastest = Math.max(...speeds);
            expect(fastest).toBeLessThanOrEqual(velocity * 1.15 + 0.02);
            for (const x of offsets) expect(x).toBeLessThanOrEqual(0.5);
        }
    });

    it("uses the resting stiffness from rest or when moving away from the card", () => {
        expect(omegaForGlide(-200, 0, stiffness)).toBe(stiffness.atRest);
        expect(omegaForGlide(-200, -0.5, stiffness)).toBe(stiffness.atRest);
    });

    it("stays between the quickest and slowest settle", () => {
        expect(omegaForGlide(-20, 5, stiffness)).toBe(stiffness.quickest);
        expect(omegaForGlide(-2000, 0.1, stiffness)).toBe(stiffness.slowest);
    });
});

function fakeScheduler() {
    let time = 0;
    let queue: ((time: number) => void)[] = [];
    return {
        request: (callback: (time: number) => void) => {
            queue.push(callback);
            return queue.length;
        },
        cancel: () => {
            queue = [];
        },
        now: () => time,
        frame(ms = 16) {
            time += ms;
            const run = queue;
            queue = [];
            for (const callback of run) callback(time);
        },
    };
}

describe("SpringDriver", () => {
    it("moves towards the target each frame and lands exactly on it", () => {
        const clock = fakeScheduler();
        const positions: number[] = [];
        let done = false;
        const driver = new SpringDriver((x) => positions.push(x), clock);
        driver.go(0, 0, {target: -375, omega: settle, onDone: () => (done = true)});
        for (let i = 0; i < 100 && !done; i += 1) clock.frame();
        expect(done).toBe(true);
        expect(positions.at(-1)).toBe(-375);
        expect(driver.running).toBe(false);
    });

    it("stops where it is when caught, reporting position and speed", () => {
        const clock = fakeScheduler();
        let last = 0;
        const driver = new SpringDriver((x) => (last = x), clock);
        driver.go(0, -1, {target: -750, omega: settle});
        clock.frame();
        clock.frame();
        const caught = driver.stop();
        expect(caught!.position).toBeCloseTo(last, 0);
        expect(caught!.velocity).toBeLessThan(0);
        const before = last;
        clock.frame();
        expect(last).toBe(before);
        expect(driver.running).toBe(false);
    });

    it("keeps its speed when pointed at a new target mid-flight", () => {
        const clock = fakeScheduler();
        const positions: number[] = [];
        const driver = new SpringDriver((x) => positions.push(x), clock);
        driver.go(0, 0, {target: -375, omega: settle});
        for (let i = 0; i < 6; i += 1) clock.frame();
        const speedBefore = driver.now()!.velocity;
        driver.retarget({target: -750, omega: settle});
        expect(driver.now()!.velocity).toBeCloseTo(speedBefore);
        clock.frame();
        expect(positions.at(-1)!).toBeLessThan(positions.at(-2)!);
    });
});

describe("smoothStepAt", () => {
    it("starts and ends with no jolt: speed and acceleration both zero at each end", () => {
        const at = (t: number) => smoothStepAt({offset: -1124, velocity: 0}, 750, t);
        expect(at(0).offset).toBeCloseTo(-1124);
        expect(at(0).velocity).toBeCloseTo(0);
        expect(Math.abs(at(16).velocity)).toBeLessThan(0.1);
        expect(at(750).offset).toBeCloseTo(0);
        expect(at(750).velocity).toBeCloseTo(0);
        expect(Math.abs(at(734).velocity)).toBeLessThan(0.1);
    });

    it("picks up from the speed it's already moving at, for quick repeated presses", () => {
        const start = {offset: -1500, velocity: 2};
        expect(smoothStepAt(start, 750, 0).velocity).toBeCloseTo(2);
        expect(smoothStepAt(start, 750, 750).offset).toBeCloseTo(0);
    });

    it("never runs backwards when starting from rest", () => {
        let last = -1124;
        for (let t = 0; t <= 750; t += 8) {
            const {offset} = smoothStepAt({offset: -1124, velocity: 0}, 750, t);
            expect(offset).toBeGreaterThanOrEqual(last - 1e-9);
            last = offset;
        }
    });
});
