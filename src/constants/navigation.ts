// src/constants/navigation.ts

// Define which pages are officially "Live"
const LIVE_PAGES = [
    '/',
    '/coming-soon',
];

// The centralized list of all paths
export const PATHS = {
    HOME: '/',
    TRANSFORMATIONS: '/transformations',
    PHILOSOPHY: '/philosophy',
    BLOGS: '/blogs',
    PRACTICE: '/page-main',
    COMING_SOON: '/coming-soon'
};

/**
 * Helper function to resolve a path.
 * If the target path isn't in the LIVE_PAGES list, it returns '/coming-soon'
 */
export function resolveLink(path: string): string {
    if (LIVE_PAGES.includes(path)) {
        return path;
    }
    return PATHS.COMING_SOON;
}