import {isSettled, smoothStepAt, springAt, type SpringState} from "./spring";

export type SpringRun = {target: number; onDone?: () => void} & ({omega: number} | {duration: number});

function stateAt(run: SpringRun, start: SpringState, elapsed: number): {state: SpringState; finished: boolean} {
    if ("duration" in run) {
        return {state: smoothStepAt(start, run.duration, elapsed), finished: elapsed >= run.duration};
    }
    const state = springAt(start, run.omega, elapsed);
    return {state, finished: isSettled(state)};
}

interface Scheduler {
    request: (callback: (time: number) => void) => number;
    cancel: (id: number) => void;
    now: () => number;
}

const browserScheduler: Scheduler = {
    request: (callback) => requestAnimationFrame(callback),
    cancel: (id) => cancelAnimationFrame(id),
    now: () => performance.now(),
};

export class SpringDriver {
    private frame: number | null = null;
    private startedAt = 0;
    private start: SpringState = {offset: 0, velocity: 0};
    private run: SpringRun | null = null;

    constructor(
        private readonly apply: (position: number) => void,
        private readonly scheduler: Scheduler = browserScheduler,
    ) {}

    get running(): boolean {
        return this.run !== null;
    }

    get target(): number | null {
        return this.run?.target ?? null;
    }

    now(): {position: number; velocity: number} | null {
        if (!this.run) return null;
        const {state} = stateAt(this.run, this.start, this.scheduler.now() - this.startedAt);
        return {position: this.run.target + state.offset, velocity: state.velocity};
    }

    go(position: number, velocity: number, next: SpringRun): void {
        this.cancelFrame();
        this.run = next;
        this.start = {offset: position - next.target, velocity};
        this.startedAt = this.scheduler.now();
        this.frame = this.scheduler.request(this.tick);
    }

    retarget(next: SpringRun): void {
        const current = this.now();
        if (!current) return;
        this.go(current.position, current.velocity, next);
    }

    stop(): {position: number; velocity: number} | null {
        const current = this.now();
        this.cancelFrame();
        this.run = null;
        return current;
    }

    private tick = () => {
        const run = this.run;
        if (!run) return;
        const {state, finished} = stateAt(run, this.start, this.scheduler.now() - this.startedAt);
        if (finished) {
            this.apply(run.target);
            this.run = null;
            this.frame = null;
            run.onDone?.();
            return;
        }
        this.apply(run.target + state.offset);
        this.frame = this.scheduler.request(this.tick);
    };

    private cancelFrame() {
        if (this.frame !== null) this.scheduler.cancel(this.frame);
        this.frame = null;
    }
}
