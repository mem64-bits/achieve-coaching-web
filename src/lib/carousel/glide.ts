// What happens when you let go of a carousel: the iOS / Android feel.
//
// The strip keeps the speed your finger had, slows down on its own, and comes
// to rest exactly on a card. Two small pure functions do the maths so they
// can be tested without a browser; SwipeCarousel feeds them positions from
// Swiper and runs the move.
//
// Positions are Swiper translate values in pixels (more negative = further
// along the list) and times are milliseconds, so speeds are px per ms.

export interface PositionSample {
    time: number;
    position: number;
}

// Only the last stretch of the drag counts, so an early fast flick followed
// by slowing down doesn't fling the strip.
const VELOCITY_WINDOW_MS = 80;
// If the finger stopped this long before lifting off, it was a placement,
// not a flick: no momentum.
const STOPPED_AFTER_MS = 60;

// Speed at the moment of release, from the drag's recent positions.
export function releaseVelocity(samples: PositionSample[], releasedAt: number): number {
    if (samples.length < 2) return 0;
    const last = samples[samples.length - 1];
    if (releasedAt - last.time > STOPPED_AFTER_MS) return 0;
    const recent = samples.filter((sample) => last.time - sample.time <= VELOCITY_WINDOW_MS);
    const first = recent[0];
    const elapsed = last.time - first.time;
    return elapsed > 0 ? (last.position - first.position) / elapsed : 0;
}

export interface GlideInput {
    // Where the strip is now, and how fast it's moving (px per ms).
    position: number;
    velocity: number;
    // Resting position for each card, in list order.
    snaps: number[];
    // Furthest a single flick may carry the strip, in pixels.
    maxTravel: number;
}

export interface GlidePlan {
    // Which card to come to rest on (index into `snaps`).
    index: number;
    // How long the glide takes. Zero when already there.
    duration: number;
    // CSS easing for this glide, or undefined to use the stylesheet's.
    curve?: string;
}

// How far momentum would carry the strip: speed times this many ms. iOS uses
// a similar "decelerate over roughly a third of a second" projection.
const PROJECTION_MS = 300;
// The gesture curve in effects.css is an ease-out whose starting slope is
// about 1.84 (it starts 1.84x faster than its average speed). Timing the
// glide with it makes the strip leave at exactly the finger's speed.
export const GLIDE_CURVE_SLOPE = 1.84;
// When the duration has to be capped, that fixed curve no longer matches, so
// the glide gets its own: same shape as the stylesheet's, with the first
// control point raised or lowered until the starting slope fits.
const CURVE_X1 = 0.25;
const CURVE_END = "0.45, 0.94";
// A first control point above 1 would overshoot the card and come back.
const STEEPEST_START = 1 / CURVE_X1;
// Settling onto the nearest card with no momentum behind it.
const SETTLE_MS = 320;
const SHORTEST_GLIDE_MS = 220;
const LONGEST_GLIDE_MS = 900;
// Below this a release counts as "not moving" (0.05 px/ms = 50 px/s).
const MIN_FLICK_SPEED = 0.05;

export function planGlide({position, velocity, snaps, maxTravel}: GlideInput): GlidePlan {
    if (snaps.length === 0) return {index: 0, duration: 0};

    const travel = Math.max(-maxTravel, Math.min(maxTravel, velocity * PROJECTION_MS));
    const projected = position + travel;

    let index = 0;
    snaps.forEach((snap, i) => {
        if (Math.abs(snap - projected) < Math.abs(snaps[index] - projected)) index = i;
    });

    const distance = snaps[index] - position;
    if (Math.abs(distance) < 0.5) return {index, duration: 0};

    // Carrying on the way the finger was going: start at its speed.
    const sameWay = Math.sign(distance) === Math.sign(velocity) && Math.abs(velocity) >= MIN_FLICK_SPEED;
    if (!sameWay) return {index, duration: SETTLE_MS};

    const ideal = (GLIDE_CURVE_SLOPE * Math.abs(distance)) / Math.abs(velocity);
    const duration = Math.round(Math.max(SHORTEST_GLIDE_MS, Math.min(LONGEST_GLIDE_MS, ideal)));
    if (duration === Math.round(ideal)) return {index, duration};

    // Capped: the starting slope a curve needs to leave at the finger's
    // speed over this duration (slope 1 would be a straight line).
    const slope = Math.min(STEEPEST_START, (Math.abs(velocity) * duration) / Math.abs(distance));
    return {index, duration, curve: easeOutStartingAt(slope)};
}

// Ease-out cubic-bezier whose speed at the start is `slope` times its average.
export function easeOutStartingAt(slope: number): string {
    const y1 = Math.round(CURVE_X1 * slope * 1000) / 1000;
    return `cubic-bezier(${CURVE_X1}, ${y1}, ${CURVE_END})`;
}
