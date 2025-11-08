import { test, expect } from "@playwright/test";

test.describe("URL Content Loading", () => {
	test.beforeEach(async ({ page }) => {
		// Navigate to the app with longer timeout
		await page.goto("http://localhost:5174", { timeout: 10000 });

		// Wait for the app to load
		await page.waitForSelector("body", { timeout: 10000 });
		await page.waitForSelector('[aria-label*="Theme"]', { timeout: 10000 });
		await page.waitForLoadState("domcontentloaded");
	});

	test("should load content when navigating to URL with data", async ({ page }) => {
		// Navigate directly to a URL with compressed content
		await page.goto(
			"http://localhost:5174/?filepath=Hello.txt&timestamp=1762602312071&data=eJzzSM3JyVcIzy%2FKSVEEABxJBD4%3D",
			{ timeout: 10000 }
		);

		// Wait for page to be fully loaded
		await page.waitForLoadState("networkidle");

		// Wait for app components to mount
		await page.waitForSelector('textarea[placeholder*="Paste your text"]', { timeout: 5000 });
		await page.waitForSelector('input[placeholder*="filepath"]', { timeout: 5000 });

		// Wait a bit more for the content loading effect to run
		await page.waitForTimeout(2000);

		// Check that filepath is populated
		const filepathInput = page.locator('input[placeholder*="filepath"]');
		await expect(filepathInput).toHaveValue("Hello.txt");

		// Check that text content is populated
		const textArea = page.locator('textarea[placeholder*="Paste your text"]');
		await expect(textArea).toHaveValue("Hello World!");

		// Check that the "Ready to Share" alert is visible
		await expect(page.locator("text=Ready to Share")).toBeVisible();
	});

	test("should update URL when typing content", async ({ page }) => {
		// Enter some text
		await page.locator('textarea[placeholder*="Paste your text"]').fill("Test content for URL");

		// Wait for URL to update
		await page.waitForTimeout(500);

		// Check that URL contains data parameter
		const currentUrl = page.url();
		expect(currentUrl).toContain("data=");
		expect(currentUrl).toContain("filepath=");
		expect(currentUrl).toContain("timestamp=");
	});

	test("should update filepath in URL when changed", async ({ page }) => {
		// Enter some text first
		await page.locator('textarea[placeholder*="Paste your text"]').fill("Test content");

		// Wait for initial URL update
		await page.waitForTimeout(500);

		// Change filepath
		await page.locator('input[placeholder*="filepath"]').fill("test-file.js");

		// Wait for URL to update
		await page.waitForTimeout(500);

		// Check that URL contains the new filepath
		const currentUrl = page.url();
		expect(currentUrl).toContain("filepath=test-file.js");
	});

	test("should clear URL parameters when content is cleared", async ({ page }) => {
		// Navigate with data first
		await page.goto(
			"http://localhost:5174/?filepath=Hello.txt&timestamp=1762602312071&data=eJzzSM3JyVcIzy%2FKSVEEABxJBD4%3D",
			{ timeout: 10000 }
		);
		await page.waitForLoadState("domcontentloaded");

		// Wait for content to load
		await page.waitForTimeout(1000);

		// Verify content is loaded
		await expect(page.locator('textarea[placeholder*="Paste your text"]')).toHaveValue(
			"Hello World!"
		);

		// Clear the content
		await page.locator('textarea[placeholder*="Paste your text"]').fill("");

		// Wait for URL to update
		await page.waitForTimeout(500);

		// Check that URL no longer contains data parameters
		const currentUrl = page.url();
		expect(currentUrl).not.toContain("data=");
		expect(currentUrl).not.toContain("filepath=");
		expect(currentUrl).toBe("http://localhost:5174/");
	});

	test("should copy current browser URL when copy button is clicked", async ({ page }) => {
		// Enter some text to generate URL
		await page.locator('textarea[placeholder*="Paste your text"]').fill("Copy test content");

		// Wait for URL update
		await page.waitForTimeout(500);

		// Click copy URL button
		await page.locator('button:has-text("Copy URL")').click();

		// Wait a moment for copy to complete
		await page.waitForTimeout(200);

		// Verify the URL is generated and has data parameter
		const currentUrl = page.url();
		expect(currentUrl).toContain("data=");
		expect(currentUrl).toContain("filepath=content.txt"); // default filepath
	});

	test("should handle file upload and URL update", async ({ page }) => {
		// Create a test file
		const testContent = "This is test file content\nwith multiple lines";

		// Create a file input and upload a file
		const fileInput = page.locator('input[type="file"]');

		// Create a temporary file for the test
		const { writeFileSync } = await import("fs");
		const { join } = await import("path");
		const { tmpdir } = await import("os");

		const tempFilePath = join(tmpdir(), "test-upload.txt");
		writeFileSync(tempFilePath, testContent);

		await fileInput.setInputFiles(tempFilePath);

		// Wait for processing
		await page.waitForTimeout(500);

		// Check that filepath is populated
		const filepathInput = page.locator('input[placeholder*="filepath"]');
		await expect(filepathInput).toHaveValue("test-upload.txt");

		// Check that text content is populated
		const textArea = page.locator('textarea[placeholder*="Paste your text"]');
		await expect(textArea).toHaveValue(testContent);

		// Check that URL is updated
		const currentUrl = page.url();
		expect(currentUrl).toContain("filepath=test-upload.txt");
		expect(currentUrl).toContain("data=");
	});

	test("should load compressed content with special characters", async ({ page }) => {
		// Test URL with special characters and Unicode
		const specialContent = "Hello 世界! ñáéíóú";

		// Create compressed data for special content (this would need to be pre-computed)
		// For now, just test the mechanism by typing and checking URL update
		await page.locator('textarea[placeholder*="Paste your text"]').fill(specialContent);
		await page.locator('input[placeholder*="filepath"]').fill("special-世界.txt");

		// Wait for URL update
		await page.waitForTimeout(500);

		// Check URL contains the filepath
		const currentUrl = page.url();
		expect(currentUrl).toContain("filepath=special-%E4%B8%96%E7%95%8C.txt");
		expect(currentUrl).toContain("data=");
	});
});
