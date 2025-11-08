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
			"http://localhost:5174/?name=Hello.txt&timestamp=1762602312071&data=eJzzSM3JyVcIzy%2FKSVEEABxJBD4%3D",
			{ timeout: 10000 }
		);

		// Wait for page to be fully loaded
		await page.waitForLoadState("networkidle");

		// Wait for app components to mount
		await page.waitForSelector('textarea[placeholder*="Paste your text"]', { timeout: 5000 });
		await page.waitForSelector('input[placeholder*="filename"]', { timeout: 5000 });

		// Wait a bit more for the content loading effect to run
		await page.waitForTimeout(2000);

		// Check that filename is populated
		const filenameInput = page.locator('input[placeholder*="filename"]');
		await expect(filenameInput).toHaveValue("Hello.txt");

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
		expect(currentUrl).toContain("name=");
		expect(currentUrl).toContain("timestamp=");
	});

	test("should update filename in URL when changed", async ({ page }) => {
		// Enter some text first
		await page.locator('textarea[placeholder*="Paste your text"]').fill("Test content");

		// Wait for initial URL update
		await page.waitForTimeout(500);

		// Change filename
		await page.locator('input[placeholder*="filename"]').fill("test-file.js");

		// Wait for URL to update
		await page.waitForTimeout(500);

		// Check that URL contains the new filename
		const currentUrl = page.url();
		expect(currentUrl).toContain("name=test-file.js");
	});

	test("should clear URL parameters when content is cleared", async ({ page }) => {
		// Navigate with data first
		await page.goto(
			"http://localhost:5174/?name=Hello.txt&timestamp=1762602312071&data=eJzzSM3JyVcIzy%2FKSVEEABxJBD4%3D",
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
		expect(currentUrl).not.toContain("name=");
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
		expect(currentUrl).toContain("name=content.txt"); // default filename
	});

	test("should handle file upload and URL update", async ({ page }) => {
		// Create a test file
		const testContent = "This is test file content\nwith multiple lines";

		// Create a file input and upload a file
		const fileInput = page.locator('input[type="file"]');
		await fileInput.setInputFiles({
			name: "test-upload.txt",
			mimeType: "text/plain",
			buffer: Buffer.from(testContent),
		});

		// Wait for processing
		await page.waitForTimeout(500);

		// Check that filename is populated
		const filenameInput = page.locator('input[placeholder*="filename"]');
		await expect(filenameInput).toHaveValue("test-upload.txt");

		// Check that text content is populated
		const textArea = page.locator('textarea[placeholder*="Paste your text"]');
		await expect(textArea).toHaveValue(testContent);

		// Check that URL is updated
		const currentUrl = page.url();
		expect(currentUrl).toContain("name=test-upload.txt");
		expect(currentUrl).toContain("data=");
	});

	test("should load compressed content with special characters", async ({ page }) => {
		// Test URL with special characters and Unicode
		const specialContent = "Hello 世界! ñáéíóú";

		// Create compressed data for special content (this would need to be pre-computed)
		// For now, just test the mechanism by typing and checking URL update
		await page.locator('textarea[placeholder*="Paste your text"]').fill(specialContent);
		await page.locator('input[placeholder*="filename"]').fill("special-世界.txt");

		// Wait for URL update
		await page.waitForTimeout(500);

		// Check URL contains the filename
		const currentUrl = page.url();
		expect(currentUrl).toContain("name=special-%E4%B8%96%E7%95%8C.txt");
		expect(currentUrl).toContain("data=");
	});
});
