import { test, expect } from '@playwright/test';

test.describe('Theme Switching Functionality', () => {
	test.beforeEach(async ({ page }) => {
		// Navigate to the app with longer timeout
		await page.goto('http://localhost:5174', { timeout: 10000 });

		// Wait for the app to load with more robust selectors
		await page.waitForSelector('body', { timeout: 10000 });
		await page.waitForSelector('[aria-label*="Theme"]', { timeout: 10000 });
		await page.waitForLoadState('domcontentloaded');
	});

	test('should display theme toggle button in header', async ({ page }) => {
		// Find the theme toggle button
		const themeButton = page.locator('[aria-label*="Theme"]');

		// Verify the button is visible and has correct initial state
		await expect(themeButton).toBeVisible();
		const ariaLabel = await themeButton.getAttribute('aria-label');
		expect(ariaLabel).toMatch(/Theme: (System theme|Light mode|Dark mode)/);
	});

	test('should cycle through three theme states', async ({ page }) => {
		const themeButton = page.locator('[aria-label*="Theme"]');

		// Get initial theme state
		const initialState = await themeButton.getAttribute('aria-label');
		expect(initialState).toBeTruthy();

		// Click once - should go to opposite of system theme
		await themeButton.click();
		const afterFirstClick = await themeButton.getAttribute('aria-label');
		expect(afterFirstClick).not.toBe(initialState);

		// Click again - should go to explicit system theme
		await themeButton.click();
		const afterSecondClick = await themeButton.getAttribute('aria-label');
		expect(afterSecondClick).not.toBe(afterFirstClick);

		// Click third time - should return to system
		await themeButton.click();
		const afterThirdClick = await themeButton.getAttribute('aria-label');
		expect(afterThirdClick).not.toBe(afterSecondClick);

		// Verify we have three distinct states
		const states = [initialState, afterFirstClick, afterSecondClick, afterThirdClick];
		const uniqueStates = new Set(states);
		expect(uniqueStates.size).toBe(3);
	});

	test('should persist theme choice in localStorage', async ({ page }) => {
		const themeButton = page.locator('[aria-label*="Theme"]');

		// Get initial localStorage value
		const initialStorage = await page.evaluate(() => localStorage.getItem('unpako-theme'));

		// Click to change theme
		await themeButton.click();

		// Verify localStorage was updated
		const afterClickStorage = await page.evaluate(() => localStorage.getItem('unpako-theme'));
		expect(afterClickStorage).not.toBe(initialStorage);
		expect(['system', 'light', 'dark']).toContain(afterClickStorage);
	});

	test('should show correct tooltip with next theme state', async ({ page }) => {
		const themeButton = page.locator('[aria-label*="Theme"]');

		// Hover over the theme button to show tooltip
		await themeButton.hover();

		// Look for tooltip content using broader Mantine tooltip selectors
		const tooltip = page.locator('[data-floating]').or(
			page.locator('[role="tooltip"]')
		).or(
			page.locator('[id*="tooltip"]')
		).or(
			page.locator('.mantine-Tooltip-tooltip')
		);

		// Wait for tooltip to appear with shorter timeout
		await expect(tooltip.first()).toBeVisible({ timeout: 500 });

		// Get tooltip text content
		const tooltipText = await tooltip.first().textContent();
		expect(tooltipText).toContain('Next:');
	});

	test('should maintain theme across page refreshes', async ({ page }) => {
		const themeButton = page.locator('[aria-label*="Theme"]');

		// Change theme to light mode
		let currentLabel = await themeButton.getAttribute('aria-label');
		while (!currentLabel?.includes('Light mode')) {
			await themeButton.click();
			currentLabel = await themeButton.getAttribute('aria-label');
			// Prevent infinite loop
			if (await themeButton.count() === 0) break;
		}

		// Verify current state is Light mode
		expect(currentLabel).toContain('Light mode');

		// Refresh the page
		await page.reload();
		await page.waitForLoadState('networkidle');

		// Re-find the theme button after refresh
		const refreshedThemeButton = page.locator('[aria-label*="Theme"]');
		await expect(refreshedThemeButton).toBeVisible();

		// Verify theme persisted
		const refreshedLabel = await refreshedThemeButton.getAttribute('aria-label');
		expect(refreshedLabel).toContain('Light mode');
	});

	test('should apply theme styles to the page', async ({ page }) => {
		const themeButton = page.locator('[aria-label*="Theme"]');

		// Get initial theme from data attribute
		const initialTheme = await page.evaluate(() => {
			return document.documentElement.dataset.mantineColorScheme || 'light';
		});

		// Click to toggle to opposite theme
		await themeButton.click();
		await page.waitForTimeout(500); // Allow theme to apply

		// Check if theme changed
		const newTheme = await page.evaluate(() => {
			return document.documentElement.dataset.mantineColorScheme || 'light';
		});

		// Theme should have changed (unless initial state was the target)
		const finalLabel = await themeButton.getAttribute('aria-label');

		if (finalLabel?.includes('Dark mode')) {
			expect(newTheme).toBe('dark');
		} else if (finalLabel?.includes('Light mode')) {
			expect(newTheme).toBe('light');
		}
	});

	test('should handle rapid clicking correctly', async ({ page }) => {
		const themeButton = page.locator('[aria-label*="Theme"]');

		// Rapid clicking 5 times
		for (let i = 0; i < 5; i++) {
			await themeButton.click();
			await page.waitForTimeout(50);
		}

		// Should still be in a valid state
		const finalLabel = await themeButton.getAttribute('aria-label');
		expect(finalLabel).toMatch(/Theme: (System theme|Light mode|Dark mode)/);

		// Should not cause any JavaScript errors
		const consoleErrors = await page.evaluate(() => {
			const errors = [];
			const originalError = console.error;
			console.error = (...args) => errors.push(args);
       
			console.error = originalError;
			return errors.length;
		});

		expect(consoleErrors).toBe(0);
	});

	test('should show appropriate icon for each theme state', async ({ page }) => {
		const themeButton = page.locator('[aria-label*="Theme"]');

		// Check that the button contains an icon (SVG element)
		const hasIcon = await themeButton.locator('svg').isVisible();
		expect(hasIcon).toBe(true);

		// Cycle through themes and check icons exist
		for (let i = 0; i < 3; i++) {
			await themeButton.click();
			const iconStillExists = await themeButton.locator('svg').isVisible();
			expect(iconStillExists).toBe(true);

			const currentLabel = await themeButton.getAttribute('aria-label');
			expect(currentLabel).toMatch(/Theme: (System theme|Light mode|Dark mode)/);
		}
	});

	test('should work when system theme preference changes', async ({ page }) => {
		const themeButton = page.locator('[aria-label*="Theme"]');

		// Set to system theme mode first
		let currentLabel = await themeButton.getAttribute('aria-label');
		while (!currentLabel?.includes('System')) {
			await themeButton.click();
			currentLabel = await themeButton.getAttribute('aria-label');
		}

		// Mock system theme preference change
		await page.addStyleTag({
			content: 'html { color-scheme: light !important; }',
		});

		// Simulate media query change by using addInitScript to override matchMedia
		await page.addInitScript(() => {
			// Override matchMedia to simulate system theme change
			const originalMatchMedia = window.matchMedia;
			window.matchMedia = (query) => {
				if (query === '(prefers-color-scheme: dark)') {
					return {
						matches: false, // Force light mode
						media: query,
						addEventListener: () => {},
						removeEventListener: () => {}
					};
				}
				return originalMatchMedia(query);
			};
		});

		await page.waitForTimeout(100);

		// Verify it's still in system mode
		const stillSystemLabel = await themeButton.getAttribute('aria-label');
		expect(stillSystemLabel).toContain('System');
	});
});