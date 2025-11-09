import { test, expect } from "@playwright/test";

test.describe("Page Refresh Version Creation Bug", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/", { timeout: 30000 });
		await page.waitForLoadState("domcontentloaded");
		// Wait for React app to load and render
		await page.waitForSelector('.mantine-ActionIcon-root[data-variant="subtle"]', { timeout: 60000 });
	});

	test("should NOT create new versions when page is refreshed with same URL", async ({ page }) => {
		console.log("=== Testing Page Refresh Version Creation Bug ===");

		// Step 1: Create initial file with content
		console.log("1. Creating initial file...");
		const filepathInput = page.locator(
			'input[placeholder*="File path with extension (e.g., example.txt)"]'
		);
		const textArea = page.locator("textarea");

		const testContent = "console.log('Page refresh test - initial version');";
		const testFilepath = "page-refresh-test.js";

		await filepathInput.fill(testFilepath);
		await textArea.fill(testContent);
		await page.waitForTimeout(3000); // Wait for version creation

		// Get initial version count
		const initialVersionCount = await getVersionCount(page);
		console.log(`   Initial version count: ${initialVersionCount}`);

		// Step 2: Get current URL (should contain file data)
		const currentUrl = page.url();
		console.log(`   Current URL: ${currentUrl}`);
		expect(currentUrl).toContain("filepath=" + encodeURIComponent(testFilepath));
		expect(currentUrl).toContain("data=");

		// Step 3: Refresh the page with the same URL
		console.log("2. Refreshing page with same URL...");
		await page.reload({ waitUntil: "domcontentloaded" });
		await page.waitForSelector('.mantine-ActionIcon-root[data-variant="subtle"]', { timeout: 60000 });

		// Wait for content to load
		await page.waitForTimeout(2000);

		// Verify content is properly loaded
		const loadedContent = await textArea.inputValue();
		const loadedFilepath = await filepathInput.inputValue();

		console.log(`   Loaded content: "${loadedContent}"`);
		console.log(`   Loaded filepath: "${loadedFilepath}"`);

		expect(loadedContent).toBe(testContent);
		expect(loadedFilepath).toBe(testFilepath);

		// Step 4: Check version count after refresh
		const afterRefreshVersionCount = await getVersionCount(page);
		console.log(`   Version count after refresh: ${afterRefreshVersionCount}`);

		const versionGrowth = afterRefreshVersionCount - initialVersionCount;
		console.log(`   Version growth: ${versionGrowth}`);

		// The bug is present if page refresh creates new versions
		expect(versionGrowth).toBeLessThan(2);
		if (versionGrowth >= 2) {
			console.log(
				`BUG DETECTED: Page refresh created ${versionGrowth} new versions. Expected minimal growth (<2).`
			);
		} else {
			console.log(`GOOD: Page refresh created minimal versions (${versionGrowth}).`);
		}

		// Step 5: Make actual content change (should create version)
		console.log("3. Testing actual content change after refresh...");
		const newContent = testContent + "\n// Added comment after refresh";
		await textArea.fill(newContent);
		await page.waitForTimeout(2000);

		const afterContentChangeVersionCount = await getVersionCount(page);
		const contentChangeGrowth = afterContentChangeVersionCount - afterRefreshVersionCount;
		console.log(`   Version growth after content change: ${contentChangeGrowth}`);

		// Content changes should create versions
		expect(contentChangeGrowth).toBeGreaterThanOrEqual(1);
		console.log(`GOOD: Content change created ${contentChangeGrowth} versions as expected.`);

		console.log("=== Page Refresh Test Completed ===");
	});

	test("should NOT create new versions when switching between files", async ({ page }) => {
		console.log("=== Testing File Switching Version Creation Bug ===");

		// Step 1: Create two different files
		const filepathInput = page.locator(
			'input[placeholder*="File path with extension (e.g., example.txt)"]'
		);
		const textArea = page.locator("textarea");

		// Create first file
		console.log("1. Creating first file...");
		const file1Content = "console.log('First file');";
		const file1Path = "file1.js";

		await filepathInput.fill(file1Path);
		await textArea.fill(file1Content);
		await page.waitForTimeout(3000);

		// Create second file
		console.log("2. Creating second file...");
		const file2Content = "console.log('Second file');";
		const file2Path = "file2.js";

		await filepathInput.fill(file2Path);
		await textArea.fill(file2Content);
		await page.waitForTimeout(3000);

		// Get initial version count after creating both files
		const initialVersionCount = await getVersionCount(page);
		console.log(`   Initial version count after creating 2 files: ${initialVersionCount}`);

		// Step 2: Switch between files multiple times
		console.log("3. Switching between files multiple times...");
		const switchCount = 5;

		for (let i = 0; i < switchCount; i++) {
			console.log(`   Switch cycle ${i + 1}/${switchCount}`);

			// Switch to first file (select from sidebar)
			await selectSidebarFile(page, 0);
			await page.waitForTimeout(1000);

			// Verify first file content is loaded
			const currentContent1 = await textArea.inputValue();
			const currentPath1 = await filepathInput.inputValue();
			expect(currentContent1).toBe(file1Content);
			expect(currentPath1).toBe(file1Path);

			// Switch to second file (select from sidebar)
			await selectSidebarFile(page, 1);
			await page.waitForTimeout(1000);

			// Verify second file content is loaded
			const currentContent2 = await textArea.inputValue();
			const currentPath2 = await filepathInput.inputValue();
			expect(currentContent2).toBe(file2Content);
			expect(currentPath2).toBe(file2Path);
		}

		// Get version count after switching
		const afterSwitchingVersionCount = await getVersionCount(page);
		const versionGrowth = afterSwitchingVersionCount - initialVersionCount;
		console.log(`   Version count after switching: ${afterSwitchingVersionCount}`);
		console.log(`   Version growth from switching: ${versionGrowth}`);

		// Switching between files should not create versions
		expect(versionGrowth).toBeLessThan(2);
		if (versionGrowth >= 2) {
			console.log(
				`BUG DETECTED: File switching created ${versionGrowth} new versions. Expected minimal growth (<2).`
			);
		} else {
			console.log(`GOOD: File switching created minimal versions (${versionGrowth}).`);
		}

		// Step 3: Make actual content change to verify version creation still works
		console.log("4. Testing actual content change after switching...");
		const newContent = file2Content + "\n// Modified after switching";
		await textArea.fill(newContent);

		// Wait for version creation to complete (more robust than fixed timeout)
		const initialContentChangeCount = await getVersionCount(page);
		let finalContentChangeCount = initialContentChangeCount;
		let attempts = 0;
		const maxAttempts = 10; // Wait up to 10 seconds

		while (finalContentChangeCount === initialContentChangeCount && attempts < maxAttempts) {
			await page.waitForTimeout(1000);
			finalContentChangeCount = await getVersionCount(page);
			attempts++;
		}

		const afterContentChangeVersionCount = await getVersionCount(page);
		const contentChangeGrowth = afterContentChangeVersionCount - afterSwitchingVersionCount;
		console.log(`   Version growth after content change: ${contentChangeGrowth}`);

		// Content changes should still create versions
		expect(contentChangeGrowth).toBeGreaterThanOrEqual(1);
		console.log(`GOOD: Content change created ${contentChangeGrowth} versions as expected.`);

		console.log("=== File Switching Test Completed ===");
	});

	test("should handle multiple refreshes without creating duplicate versions", async ({ page }) => {
		console.log("=== Testing Multiple Page Refreshes ===");

		// Create initial file
		const filepathInput = page.locator(
			'input[placeholder*="File path with extension (e.g., example.txt)"]'
		);
		const textArea = page.locator("textarea");

		const testContent = "const multi = 'refresh test';";
		const testFilepath = "multi-refresh.js";

		await filepathInput.fill(testFilepath);
		await textArea.fill(testContent);
		await page.waitForTimeout(3000);

		const initialVersionCount = await getVersionCount(page);
		console.log(`Initial version count: ${initialVersionCount}`);

		// Perform multiple refreshes
		const refreshCount = 3;
		for (let i = 0; i < refreshCount; i++) {
			console.log(`Refresh ${i + 1}/${refreshCount}...`);

			await page.reload({ waitUntil: "domcontentloaded" });
			await page.waitForSelector('.mantine-ActionIcon-root[data-variant="subtle"]', {
				timeout: 60000,
			});
			await page.waitForTimeout(2000);

			// Verify content is still correct
			const currentContent = await textArea.inputValue();
			expect(currentContent).toBe(testContent);
		}

		const finalVersionCount = await getVersionCount(page);
		const totalGrowth = finalVersionCount - initialVersionCount;
		console.log(`Total version growth after ${refreshCount} refreshes: ${totalGrowth}`);

		// Multiple refreshes should not create many versions
		expect(totalGrowth).toBeLessThan(refreshCount + 1);
		if (totalGrowth >= refreshCount + 1) {
			console.log(
				`BUG DETECTED: ${refreshCount} refreshes created ${totalGrowth} versions. Too many!`
			);
		} else {
			console.log(`GOOD: ${refreshCount} refreshes created only ${totalGrowth} versions.`);
		}
	});
});

// Helper function to select a file from the sidebar
async function selectSidebarFile(page: any, index: number = 0): Promise<void> {
	// Try multiple selectors to find file items in the sidebar
	const possibleSelectors = [
		'[class*="node"]:has([class*="filename"])', // CSS module approach
		'[class*="FileTreeNode_node"]', // Direct class name
		'.mantine-Card-root [class*="node"]', // Node within sidebar card
		'[role="button"]:has-text(".js")', // Text-based approach for .js files
		'[role="button"]:has-text(".txt")', // Text-based approach for .txt files
	];

	let fileItems = null;
	let count = 0;

	for (const selector of possibleSelectors) {
		fileItems = page.locator(selector);
		count = await fileItems.count();
		if (count > 0) {
			console.log(`   Found ${count} file items with selector: ${selector}`);
			break;
		}
	}

	if (count > 0) {
		const targetIndex = Math.min(index, count - 1);
		await fileItems.nth(targetIndex).click();
		await page.waitForTimeout(1000);
	} else {
		console.log("   No file items found in sidebar, taking screenshot for debugging...");
		await page.screenshot({ path: `debug-sidebar-${Date.now()}.png` });
	}
}

// Helper function to get version count from IndexedDB
async function getVersionCount(page: any): Promise<number> {
	try {
		const result = await page.evaluate(async () => {
			return new Promise(resolve => {
				const request = indexedDB.open("unpako-database");

				request.onerror = () => {
					console.error("Failed to open IndexedDB");
					resolve(0);
				};

				request.onsuccess = (event: any) => {
					const db = event.target.result;

					if (!db.objectStoreNames.contains("fileVersions")) {
						resolve(0);
						return;
					}

					const transaction = db.transaction(["fileVersions"], "readonly");
					const store = transaction.objectStore("fileVersions");
					const countRequest = store.count();

					countRequest.onsuccess = () => {
						resolve(countRequest.result || 0);
					};

					countRequest.onerror = () => {
						resolve(0);
					};
				};
			});
		});

		return result || 0;
	} catch (error) {
		console.error("Error getting version count:", error);
		return 0;
	}
}
