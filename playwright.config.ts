import {defineConfig, devices} from "@playwright/test";

// Browser tests for the home page, run against the production build so they
// see real image sizes and timings: `npm run test:e2e` builds, then tests.
// `npm run test:e2e:only` skips the build when nothing has changed.
const PORT = 4322;

export default defineConfig({
    testDir: "tests/e2e",
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 1 : 0,
    reporter: process.env.CI ? [["list"], ["html", {open: "never"}]] : [["list"]],
    timeout: 60_000,
    expect: {timeout: 10_000},
    use: {
        baseURL: `http://localhost:${PORT}`,
        trace: "retain-on-failure",
        screenshot: "only-on-failure",
    },
    webServer: {
        command: "node tests/e2e/static-server.mjs",
        url: `http://localhost:${PORT}`,
        reuseExistingServer: !process.env.CI,
        env: {PORT: String(PORT)},
    },
    // One project per layout the carousel has: one card on phones and
    // tablets, three from 1024px.
    projects: [
        {name: "desktop", use: {...devices["Desktop Chrome"], viewport: {width: 1440, height: 900}}},
        {name: "laptop", use: {...devices["Desktop Chrome"], viewport: {width: 1024, height: 768}}},
        {name: "tablet", use: {...devices["Desktop Chrome"], viewport: {width: 768, height: 1024}, hasTouch: true}},
        {name: "phone", use: {...devices["Pixel 7"]}},
    ],
});
