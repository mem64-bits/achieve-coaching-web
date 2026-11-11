export interface SpringState {
    offset: number;
    velocity: number;
}

export function springAt(start: SpringState, omega: number, elapsed: number): SpringState {
    const {offset: x0, velocity: v0} = start;
    const decay = Math.exp(-omega * elapsed);
    const b = v0 + omega * x0;
    return {
        offset: (x0 + b * elapsed) * decay,
        velocity: (v0 - omega * b * elapsed) * decay,
    };
}

export function isSettled({offset, velocity}: SpringState): boolean {
    return Math.abs(offset) < 0.35 && Math.abs(velocity) < 0.01;
}

export function omegaForSettleTime(ms: number): number {
    return 6.64 / ms;
}

export interface GlideStiffness {
    atRest: number;
    quickest: number;
    slowest: number;
}

export function omegaForGlide(offset: number, velocity: number, {atRest, quickest, slowest}: GlideStiffness): number {
    const distance = Math.abs(offset);
    const towardsCard = -Math.sign(offset) * velocity;
    if (distance < 0.5 || towardsCard <= 0) return atRest;
    const noFasterThanTheHand = (2 * towardsCard) / distance;
    return Math.min(quickest, Math.max(slowest, noFasterThanTheHand));
}

export function smoothStepAt(start: SpringState, duration: number, elapsed: number): SpringState {
    const tau = Math.min(Math.max(elapsed / duration, 0), 1);
    const c0 = start.offset;
    const c1 = start.velocity * duration;
    const toCover = -(c0 + c1);
    const c3 = 10 * toCover + 4 * c1;
    const c4 = -15 * toCover - 7 * c1;
    const c5 = 6 * toCover + 3 * c1;
    const offset = c0 + c1 * tau + c3 * tau ** 3 + c4 * tau ** 4 + c5 * tau ** 5;
    const velocity = (c1 + 3 * c3 * tau ** 2 + 4 * c4 * tau ** 3 + 5 * c5 * tau ** 4) / duration;
    return {offset, velocity};
}
