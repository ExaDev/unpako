import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright configuration for testing against staging environment
 * Used in CI/CD pipeline to test deployed GitHub Pages staging before promoting to production
 */
export default defineConfig({
	testDir: "./src",
	testMatch: "**/*.e2e.test.{ts,tsx}",
	/* Run tests in files in parallel */
	fullyParallel: true,
	/* Fail the build on CI if you accidentally left test.only in the source code. */
	forbidOnly: !!process.env.CI,
	/* Retry on CI only */
	retries: process.env.CI ? 2 : 0,
	/* Opt out of parallel tests on CI. */
	workers: process.env.CI ? 1 : undefined,
	/* Reporter to use. See https://playwright.dev/docs/test-reporters */
	reporter: [["html"], ["json", { outputFile: "coverage/playwright-staging-report.json" }]],
	/* Global timeout for each test - increased for staging environment where loading takes longer */
	timeout: 120000, // 2 minutes
	/* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
	use: {
		/* Base URL to use in actions like `await page.goto('/')`. */
		baseURL: process.env.BASE_URL || "https://octocat.github.io/unpako/",

		/* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
		trace: "on-first-retry",
	},

	/* Configure projects for major browsers */
	projects: [
		{
			name: "chromium",
			use: { ...devices["Desktop Chrome"] },
		},
	],

	/* Don't run local dev server for staging tests */
	webServer: undefined,
});
