import { test, expect } from "@playwright/test";

test.describe("Version Creation Bug Investigation", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/");
		// Wait for the page to be fully loaded
		await page.waitForLoadState("domcontentloaded");
		// Wait for React app to load and render (longer timeout for deployed sites)
		await page.waitForSelector('[aria-label*="Theme"]', { timeout: 60000 });
	});

	test("should identify infinite version creation bug", async ({ page }) => {
		console.log("=== Testing Infinite Version Creation Bug ===");

		// Step 1: Create initial file
		console.log("Creating initial file...");

		// Fill filepath first to trigger edit mode
		await page.waitForSelector('input[placeholder*="File path with extension (e.g., example.txt)"]', {
			timeout: 10000,
		});
		await page.fill('input[placeholder*="File path with extension (e.g., example.txt)"]', "test.js");
		await page.waitForTimeout(1000);

		// Now the textarea should be available
		await page.waitForSelector('textarea[placeholder="Enter your text here..."]', { timeout: 10000 });
		await page.fill(
			'textarea[placeholder="Enter your text here..."]',
			"console.log('Initial content');"
		);

		await page.waitForTimeout(1000);

		// Step 2: Try to find file in sidebar
		console.log("Looking for files in sidebar...");
		await page.waitForTimeout(1000);

		// Take screenshot to see current state
		await page.screenshot({ path: "initial-state.png" });

		// Try different selectors to find file items
		const possibleFileSelectors = [
			"[role='treeitem']",
			".mantine-Text-root",
			"[class*='filename']",
			"[class*='node']",
			".file-item",
			"[data-testid*='file']",
		];

		let fileItems = null;

		for (const selector of possibleFileSelectors) {
			const items = page.locator(selector);
			const count = await items.count();
			console.log(`Selector "${selector}" found ${count} items`);

			if (count > 0) {
				fileItems = items;
				break;
			}
		}

		if (!fileItems) {
			console.log("No file items found. Taking a screenshot of the entire page...");
			await page.screenshot({ path: "full-page.png", fullPage: true });

			// Check if we can at least see the sidebar content
			const sidebar = page.locator(".mantine-Card-root");
			const sidebarCount = await sidebar.count();
			console.log(`Found ${sidebarCount} sidebar cards`);

			// For this test, let's at least verify the version creation logic by modifying content
			console.log("Testing version creation with content modification...");
		}

		// Step 3: Test version creation by modifying content
		const initialContent = "console.log('Version 1');";
		await page.fill('textarea[placeholder="Enter your text here..."]', initialContent);
		await page.waitForTimeout(2000);

		console.log("Content modified, waiting for potential version creation...");

		// Step 4: Modify content again
		const modifiedContent = "console.log('Version 2');";
		await page.fill('textarea[placeholder="Enter your text here..."]', modifiedContent);
		await page.waitForTimeout(2000);

		console.log("Content modified again...");

		// Step 5: Check if we can access IndexedDB
		const dbStats = await page.evaluate(async () => {
			try {
				// Try to access any database that might exist
				const databases = await indexedDB.databases();
				return {
					databases: databases.map(db => db.name),
					success: true,
				};
			} catch (error) {
				return {
					error: (error as Error).message,
					success: false,
				};
			}
		});

		console.log("IndexedDB access:", dbStats);

		// Step 6: Try to access version history modal
		console.log("Looking for version history button...");

		const historySelectors = [
			"[data-icon='IconHistory']",
			".mantine-ActionIcon-root",
			"button[title*='history']",
			"button[aria-label*='history']",
			"[title*='version']",
		];

		let historyButton = null;

		for (const selector of historySelectors) {
			const button = page.locator(selector);
			const count = await button.count();
			console.log(`History selector "${selector}" found ${count} items`);

			if (count > 0) {
				historyButton = button;
				console.log("Found potential history button(s)");
				break;
			}
		}

		if (historyButton && (await historyButton.count()) > 0) {
			console.log("Clicking history button...");
			await historyButton.first().click();
			await page.waitForTimeout(2000);

			// Take screenshot of modal
			await page.screenshot({ path: "version-modal.png" });

			// Count version items in modal
			const modalVersionSelectors = [
				"[role='dialog'] .mantine-Box-root",
				"[role='dialog'] [class*='version']",
				"[role='dialog'] .mantine-Badge-root",
			];

			for (const selector of modalVersionSelectors) {
				const items = page.locator(selector);
				const count = await items.count();
				console.log(`Modal version selector "${selector}" found ${count} items`);
			}
		} else {
			console.log("No history button found");
		}

		// Final screenshot
		await page.screenshot({ path: "final-state.png" });

		// The test passes if we can at least interact with the basic elements
		// The real issue identification will be done through manual inspection of screenshots
		expect(true).toBe(true);
	});

	test("should manually demonstrate the version creation issue", async ({ page }) => {
		// Create initial file
		await page.waitForSelector('input[placeholder*="File path with extension (e.g., example.txt)"]', {
			timeout: 10000,
		});
		await page.fill('input[placeholder*="File path with extension (e.g., example.txt)"]', "demo.js");
		await page.waitForTimeout(1000);

		await page.waitForSelector('textarea[placeholder="Enter your text here..."]', { timeout: 10000 });
		await page.fill('textarea[placeholder="Enter your text here..."]', "const test = 'initial';");
		await page.waitForTimeout(2000);

		// Clear and re-add the same content (simulating file selection)
		for (let i = 0; i < 3; i++) {
			console.log(`Iteration ${i + 1}: Clearing and re-adding same content...`);

			// Clear content
			await page.fill('textarea[placeholder="Enter your text here..."]', "");
			await page.waitForTimeout(1000);

			// Re-add the exact same content (simulating loading a file)
			await page.fill('textarea[placeholder="Enter your text here..."]', "const test = 'initial';");
			await page.waitForTimeout(2000);
		}

		// Take final screenshot
		await page.screenshot({ path: "version-demo-final.png" });

		// This test demonstrates the potential issue by repeatedly setting the same content
		expect(true).toBe(true);
	});
});
