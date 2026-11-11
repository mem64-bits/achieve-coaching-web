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
const VELOCITY_WINDOW_MS = 100;
// If the finger stopped this long before lifting off, it was a placement,
// not a flick: no momentum.
const STOPPED_AFTER_MS = 60;

// Speed at the moment of release, from the drag's recent positions.
//
// A flick usually slows down in its last few frames. An average over the
// window then hands the glide a speed the hand had already left behind, and
// the strip slowed with the hand and then lurched forward on release (seen
// in a screen recording: 134, 112, 58, 12 px a frame, then 64). So, like
// Android's VelocityTracker, this fits a curve (position = a + b*t + c*t^2,
// least squares) through the window and takes its slope at the last sample:
// the speed the hand actually had at the end.
export function releaseVelocity(samples: PositionSample[], releasedAt: number): number {
    if (samples.length < 2) return 0;
    const last = samples[samples.length - 1];
    if (releasedAt - last.time > STOPPED_AFTER_MS) return 0;
    const recent = samples.filter((sample) => last.time - sample.time <= VELOCITY_WINDOW_MS);
    if (recent.length < 2) return 0;

    const first = recent[0];
    const elapsed = last.time - first.time;
    if (elapsed <= 0) return 0;
    const average = (last.position - first.position) / elapsed;
    if (recent.length < 3) return average;

    const atEnd = slopeAtEnd(recent, last);
    if (!Number.isFinite(atEnd)) return average;
    // Fitted to be turning round: the hand was coming to a stop.
    if (Math.sign(atEnd) !== Math.sign(average)) return 0;
    // A curve can overshoot: through a flick that sped up and then slowed
    // inside the window it ran high (23 px a frame for a hand ending at 12).
    // So never faster than the hand's latest stretch (the last 16ms or so,
    // long enough to smooth over a high-rate mouse's tiny steps).
    const latest = latestSpeed(recent, last);
    return Math.sign(atEnd) * Math.min(Math.abs(atEnd), Math.abs(latest));
}

const LATEST_STRETCH_MS = 16;

// Speed from the newest sample at least LATEST_STRETCH_MS older than the last
// one (or the oldest there is) to the last.
function latestSpeed(samples: PositionSample[], last: PositionSample): number {
    let from = samples[0];
    for (const sample of samples) {
        if (last.time - sample.time >= LATEST_STRETCH_MS) from = sample;
    }
    const elapsed = last.time - from.time;
    return elapsed > 0 ? (last.position - from.position) / elapsed : 0;
}

// Least-squares fit of position = a + b*t + c*t^2, with t measured back from
// the last sample (so t = 0 there); returns b, the slope at the last sample.
function slopeAtEnd(samples: PositionSample[], last: PositionSample): number {
    // Sums for the normal equations.
    let n = 0, t1 = 0, t2 = 0, t3 = 0, t4 = 0, y0 = 0, y1 = 0, y2 = 0;
    for (const sample of samples) {
        const t = sample.time - last.time;
        const y = sample.position - last.position;
        n += 1;
        t1 += t;
        t2 += t * t;
        t3 += t * t * t;
        t4 += t * t * t * t;
        y0 += y;
        y1 += t * y;
        y2 += t * t * y;
    }
    // Solve [n t1 t2; t1 t2 t3; t2 t3 t4] [a b c] = [y0 y1 y2] for b (Cramer's rule).
    const det = n * (t2 * t4 - t3 * t3) - t1 * (t1 * t4 - t3 * t2) + t2 * (t1 * t3 - t2 * t2);
    if (Math.abs(det) < 1e-9) return NaN;
    const detB = n * (y1 * t4 - t3 * y2) - y0 * (t1 * t4 - t3 * t2) + t2 * (t1 * y2 - y1 * t2);
    return detB / det;
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
    // CSS easing for this glide. Missing only when there's no move to make.
    curve?: string;
}

// How far momentum would carry the strip: speed times this many ms. iOS uses
// a similar "decelerate over roughly a third of a second" projection.
const PROJECTION_MS = 300;
// The gesture curve in effects.css is an ease-out whose starting slope is
// about 1.84 (it starts 1.84x faster than its average speed). Timing the
// glide with it makes the strip leave at exactly the finger's speed.
export const GLIDE_CURVE_SLOPE = 1.84;
// Every glide gets its own curve: the stylesheet's shape, with the first
// control point raised or lowered until the strip starts at the speed it
// already has. That matters most when it has none: a mouse usually stops
// before the button comes up, and an ease-out from rest jumps straight to
// full speed, which read as a snap. From rest the curve starts flat instead,
// like a phone's spring.
const CURVE_X1 = 0.25;
const CURVE_END = "0.45, 0.94";
// A first control point above 1 would overshoot the card and come back.
const STEEPEST_START = 1 / CURVE_X1;
// Let go while still moving away from the card it settles on, the strip
// carries on that way for a moment before turning back (a negative first
// control point), as a real spring would. Capped so it only leans, never
// swings out a long way.
const FURTHEST_LEAN = -1;
// Settling onto the nearest card with little or no momentum behind it.
const SETTLE_MS = 380;
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

    // Carrying on the way the finger was going at a real speed: take about
    // as long as the stylesheet's curve would to shed that speed. Otherwise
    // it's a settle.
    const sameWay = Math.sign(distance) === Math.sign(velocity) && Math.abs(velocity) >= MIN_FLICK_SPEED;
    const ideal = (GLIDE_CURVE_SLOPE * Math.abs(distance)) / Math.abs(velocity);
    const duration = sameWay
        ? Math.round(Math.max(SHORTEST_GLIDE_MS, Math.min(LONGEST_GLIDE_MS, ideal)))
        : SETTLE_MS;

    // The starting slope a curve needs to leave at the strip's current speed
    // over this duration (slope 1 would be a straight line; 0 starts from
    // rest; below 0 leans the way it was going first).
    const towardsCard = velocity * Math.sign(distance);
    const slope = (towardsCard * duration) / Math.abs(distance);
    return {index, duration, curve: easeOutStartingAt(Math.max(FURTHEST_LEAN, Math.min(STEEPEST_START, slope)))};
}

// Cubic-bezier whose speed at the start is `slope` times its average, easing
// out to a stop on the card.
export function easeOutStartingAt(slope: number): string {
    const y1 = Math.round(CURVE_X1 * slope * 1000) / 1000;
    return `cubic-bezier(${CURVE_X1}, ${y1}, ${CURVE_END})`;
}
