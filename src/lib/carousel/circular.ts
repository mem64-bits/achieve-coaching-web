// Positions in a list that wraps round like a circular linked list: after
// the last item comes the first, and before the first comes the last. The
// carousels use these to step a whole batch at a time and to work out which
// photos to load before they slide into view. Pure functions, so the tests
// can use them as the reference for what the carousel should show.

// Where `index` lands once it wraps round a list of `length` items.
// wrapIndex(23, 23) is 0 and wrapIndex(-1, 23) is 22.
export function wrapIndex(index: number, length: number): number {
    if (length <= 0) return 0;
    return ((index % length) + length) % length;
}

// The items on screen when `first` is the leftmost one and `size` fit
// across, following the list round past the end.
// visibleWindow(21, 3, 23) is [21, 22, 0].
export function visibleWindow(first: number, size: number, length: number): number[] {
    const count = Math.min(Math.max(size, 0), length);
    return Array.from({length: count}, (_, offset) => wrapIndex(first + offset, length));
}

// Where the next batch starts after a step of `size` in `direction`
// (1 forward, -1 back).
export function nextBatchStart(first: number, size: number, length: number, direction: 1 | -1 = 1): number {
    return wrapIndex(first + direction * size, length);
}

// Every item that should be ready before the next step either way: the batch
// on screen plus one batch before and after it, wrapping round.
export function itemsToPreload(first: number, size: number, length: number): Set<number> {
    return new Set(visibleWindow(first - size, size * 3, length));
}

// The order the carousel shows every item in, starting from `first` and
// stepping a batch at a time until it is back where it began. Each item
// appears once, in list order, however the batches fall across the end.
export function fullCycle(first: number, size: number, length: number): number[][] {
    const batches: number[][] = [];
    const seen = new Set<number>();
    let start = first;
    while (seen.size < length) {
        const batch = visibleWindow(start, size, length);
        batch.forEach((index) => seen.add(index));
        batches.push(batch);
        start = nextBatchStart(start, size, length);
    }
    return batches;
}
