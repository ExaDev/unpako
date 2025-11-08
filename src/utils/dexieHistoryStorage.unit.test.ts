import { DexieHistoryStorage } from "./dexieHistoryStorage";
import { db } from "./db";

describe("DexieHistoryStorage", () => {
	beforeEach(async () => {
		// Clear all data before each test
		await db.fileHistory.clear();
	});

	afterEach(async () => {
		// Clean up after each test
		await db.fileHistory.clear();
	});

	describe("addToHistory", () => {
		it("should add a new item to history", async () => {
			const now = Date.now();
			const testItem = {
				data: "dGVzdCBkYXRh", // base64 encoded "test data"
				filepath: "test.txt",
				size: 9,
				compressedSize: 5,
				createdAt: now,
				modifiedAt: now,
				type: "uploaded" as const,
			};

			await DexieHistoryStorage.addToHistory(testItem);

			const history = await DexieHistoryStorage.getHistory();
			expect(history).toHaveLength(1);
			expect(history[0]).toMatchObject(testItem);
			expect(history[0].id).toBeDefined();
		});

		it("should generate unique IDs for each item", async () => {
			const now = Date.now();
			const testItem = {
				data: "dGVzdCBkYXRh",
				filepath: "test.txt",
				size: 9,
				compressedSize: 5,
				createdAt: now,
				modifiedAt: now,
				type: "uploaded" as const,
			};

			await DexieHistoryStorage.addToHistory(testItem);
			await DexieHistoryStorage.addToHistory({
				...testItem,
				filepath: "test2.txt",
				modifiedAt: now + 1, // Update modifiedAt for the second item
			});

			const history = await DexieHistoryStorage.getHistory();
			expect(history).toHaveLength(2);
			expect(history[0].id).not.toBe(history[1].id);
		});

		it("should limit history to 50 items", async () => {
			// Add 55 items
			const now = Date.now();
			for (let i = 0; i < 55; i++) {
				await DexieHistoryStorage.addToHistory({
					data: `dGVzdCBkYXRhIGl0ZW0g${i}`,
					filepath: `test${i}.txt`,
					size: 10,
					compressedSize: 5,
					createdAt: now + i,
					modifiedAt: now + i,
					type: "uploaded" as const,
				});
			}

			const history = await DexieHistoryStorage.getHistory();
			expect(history).toHaveLength(50);
		});
	});

	describe("getHistory", () => {
		it("should return empty array when no items exist", async () => {
			const history = await DexieHistoryStorage.getHistory();
			expect(history).toEqual([]);
		});

		it("should return items sorted by modifiedAt (newest first)", async () => {
			const timestamp1 = Date.now();
			const timestamp2 = timestamp1 + 1000;
			const timestamp3 = timestamp2 + 1000;

			// Add items in random order
			await DexieHistoryStorage.addToHistory({
				data: "ZGF0YTE=", // base64 "data1"
				filepath: "middle.txt",
				size: 5,
				compressedSize: 3,
				createdAt: timestamp2,
				modifiedAt: timestamp2,
				type: "uploaded" as const,
			});

			await DexieHistoryStorage.addToHistory({
				data: "ZGF0YTI=", // base64 "data2"
				filepath: "latest.txt",
				size: 5,
				compressedSize: 3,
				createdAt: timestamp3,
				modifiedAt: timestamp3,
				type: "uploaded" as const,
			});

			await DexieHistoryStorage.addToHistory({
				data: "ZGF0YTM=", // base64 "data3"
				filepath: "oldest.txt",
				size: 5,
				compressedSize: 3,
				createdAt: timestamp1,
				modifiedAt: timestamp1,
				type: "uploaded" as const,
			});

			const history = await DexieHistoryStorage.getHistory();
			expect(history).toHaveLength(3);
			expect(history[0].filepath).toBe("latest.txt");
			expect(history[1].filepath).toBe("middle.txt");
			expect(history[2].filepath).toBe("oldest.txt");
		});
	});

	describe("removeFromHistory", () => {
		it("should remove item by ID", async () => {
			const now = Date.now();
			const testItem = {
				data: "dGVzdCBkYXRh",
				filepath: "test.txt",
				size: 9,
				compressedSize: 5,
				createdAt: now,
				modifiedAt: now,
				type: "uploaded" as const,
			};

			await DexieHistoryStorage.addToHistory(testItem);
			const history = await DexieHistoryStorage.getHistory();
			const id = history[0].id;

			await DexieHistoryStorage.removeFromHistory(id);

			const newHistory = await DexieHistoryStorage.getHistory();
			expect(newHistory).toHaveLength(0);
		});

		it("should handle removing non-existent ID gracefully", async () => {
			await DexieHistoryStorage.removeFromHistory("non-existent-id");

			// Should not throw an error
			const history = await DexieHistoryStorage.getHistory();
			expect(history).toHaveLength(0);
		});
	});

	describe("clearHistory", () => {
		it("should clear all history items", async () => {
			// Add some items
			const now = Date.now();
			for (let i = 0; i < 5; i++) {
				await DexieHistoryStorage.addToHistory({
					data: `ZGF0YSAke2l9`,
					filepath: `test${i}.txt`,
					size: 5,
					compressedSize: 3,
					createdAt: now + i,
					modifiedAt: now + i,
					type: "uploaded" as const,
				});
			}

			expect(await DexieHistoryStorage.getHistory()).toHaveLength(5);

			await DexieHistoryStorage.clearHistory();

			const history = await DexieHistoryStorage.getHistory();
			expect(history).toHaveLength(0);
		});
	});

	describe("getHistoryItem", () => {
		it("should return item by ID", async () => {
			const now = Date.now();
			const testItem = {
				data: "dGVzdCBkYXRh",
				filepath: "test.txt",
				size: 9,
				compressedSize: 5,
				createdAt: now,
				modifiedAt: now,
				type: "uploaded" as const,
			};

			await DexieHistoryStorage.addToHistory(testItem);
			const history = await DexieHistoryStorage.getHistory();
			const id = history[0].id;

			const item = await DexieHistoryStorage.getHistoryItem(id);
			expect(item).toMatchObject(testItem);
			expect(item?.id).toBe(id);
		});

		it("should return null for non-existent ID", async () => {
			const item = await DexieHistoryStorage.getHistoryItem("non-existent-id");
			expect(item).toBeNull();
		});
	});

	describe("updateHistoryItem", () => {
		it("should update item by ID", async () => {
			const now = Date.now();
			const testItem = {
				data: "dGVzdCBkYXRh",
				filepath: "test.txt",
				size: 9,
				compressedSize: 5,
				createdAt: now,
				modifiedAt: now,
				type: "uploaded" as const,
			};

			await DexieHistoryStorage.addToHistory(testItem);
			const history = await DexieHistoryStorage.getHistory();
			const id = history[0].id;

			const updates = {
				filepath: "updated.txt",
				url: "https://example.com",
				modifiedAt: Date.now(), // Update modifiedAt timestamp
			};

			await DexieHistoryStorage.updateHistoryItem(id, updates);

			const updatedItem = await DexieHistoryStorage.getHistoryItem(id);
			expect(updatedItem?.filepath).toBe("updated.txt");
			expect(updatedItem?.url).toBe("https://example.com");
			expect(updatedItem?.modifiedAt).toBe(updates.modifiedAt); // Should be updated
			// Other fields should remain unchanged
			expect(updatedItem?.data).toBe(testItem.data);
			expect(updatedItem?.size).toBe(testItem.size);
			expect(updatedItem?.createdAt).toBe(testItem.createdAt); // Should remain unchanged
		});

		it("should handle updating non-existent ID gracefully", async () => {
			await DexieHistoryStorage.updateHistoryItem("non-existent-id", {
				filepath: "updated.txt",
			});

			// Should not throw an error
			const history = await DexieHistoryStorage.getHistory();
			expect(history).toHaveLength(0);
		});
	});

	describe("getStats", () => {
		it("should return correct statistics", async () => {
			// Add some test items
			const now = Date.now();
			await DexieHistoryStorage.addToHistory({
				data: "dGVzdDE=", // base64 "test1"
				filepath: "uploaded1.txt",
				size: 5,
				compressedSize: 3,
				createdAt: now,
				modifiedAt: now,
				type: "uploaded" as const,
			});

			await DexieHistoryStorage.addToHistory({
				data: "dGVzdDI=", // base64 "test2"
				filepath: "uploaded2.txt",
				size: 5,
				compressedSize: 3,
				createdAt: now + 1,
				modifiedAt: now + 1,
				type: "uploaded" as const,
			});

			await DexieHistoryStorage.addToHistory({
				data: "dGVzdDM=", // base64 "test3"
				filepath: "downloaded1.txt",
				size: 5,
				compressedSize: 3,
				createdAt: now + 2,
				modifiedAt: now + 2,
				type: "downloaded" as const,
			});

			const stats = await DexieHistoryStorage.getStats();
			expect(stats.totalItems).toBe(3);
			expect(stats.totalSize).toBe(15); // 5 + 5 + 5
			expect(stats.totalCompressedSize).toBe(9); // 3 + 3 + 3
			expect(stats.uploadedCount).toBe(2);
			expect(stats.downloadedCount).toBe(1);
		});

		it("should return zero stats when no items exist", async () => {
			const stats = await DexieHistoryStorage.getStats();
			expect(stats).toEqual({
				totalItems: 0,
				totalSize: 0,
				totalCompressedSize: 0,
				uploadedCount: 0,
				downloadedCount: 0,
			});
		});
	});

	describe("exportHistory and importHistory", () => {
		it("should export and import history correctly", async () => {
			// Add some test items
			const now = Date.now();
			const testItems = [
				{
					data: "dGVzdDE=",
					filepath: "test1.txt",
					size: 5,
					compressedSize: 3,
					createdAt: now,
					modifiedAt: now,
					type: "uploaded" as const,
				},
				{
					data: "dGVzdDI=",
					filepath: "test2.txt",
					size: 5,
					compressedSize: 3,
					createdAt: now + 1,
					modifiedAt: now + 1,
					type: "downloaded" as const,
				},
			];

			for (const item of testItems) {
				await DexieHistoryStorage.addToHistory(item);
			}

			// Export history
			const exportedData = await DexieHistoryStorage.exportHistory();
			expect(exportedData).toContain("test1.txt");
			expect(exportedData).toContain("test2.txt");

			// Clear history
			await DexieHistoryStorage.clearHistory();
			expect(await DexieHistoryStorage.getHistory()).toHaveLength(0);

			// Import history
			const importResult = await DexieHistoryStorage.importHistory(exportedData);
			expect(importResult.success).toBe(true);
			expect(importResult.imported).toBe(2);
			expect(importResult.errors).toHaveLength(0);

			// Verify imported data
			const importedHistory = await DexieHistoryStorage.getHistory();
			expect(importedHistory).toHaveLength(2);
			expect(importedHistory[0].filepath).toBe("test2.txt"); // Should be sorted by modifiedAt
			expect(importedHistory[1].filepath).toBe("test1.txt");
		});

		it("should handle invalid JSON during import", async () => {
			const result = await DexieHistoryStorage.importHistory("invalid json");
			expect(result.success).toBe(false);
			expect(result.imported).toBe(0);
			expect(result.errors.length).toBeGreaterThan(0);
			expect(result.errors[0]).toContain("Failed to parse JSON");
		});

		it("should handle invalid item data during import", async () => {
			const invalidData = JSON.stringify([
				{
					id: "valid-item",
					data: "dGVzdA==",
					filepath: "test.txt",
					type: "uploaded",
				},
				{
					id: "invalid-item",
					// Missing required fields
				},
			]);

			const result = await DexieHistoryStorage.importHistory(invalidData);
			expect(result.success).toBe(false); // Because there are errors
			expect(result.imported).toBe(1); // Only the valid item should be imported
			expect(result.errors.length).toBeGreaterThan(0);
		});
	});

	describe("backward compatibility", () => {
		it("should migrate items with 'name' to 'filepath' during import", async () => {
			const oldFormatData = JSON.stringify([
				{
					id: "old-item",
					name: "old-filename.txt", // Old format using 'name'
					data: "dGVzdA==",
					type: "uploaded",
					size: 4,
					compressedSize: 2,
					timestamp: Date.now(),
				},
			]);

			const result = await DexieHistoryStorage.importHistory(oldFormatData);
			expect(result.success).toBe(true);
			expect(result.imported).toBe(1);

			const history = await DexieHistoryStorage.getHistory();
			expect(history[0].filepath).toBe("old-filename.txt");
			expect((history[0] as any).name).toBeUndefined(); // 'name' should be removed
			expect(history[0].createdAt).toBeDefined();
			expect(history[0].modifiedAt).toBeDefined();
		});

		it("should migrate items with single timestamp to createdAt and modifiedAt", async () => {
			const oldTimestamp = Date.now() - 10000; // 10 seconds ago to ensure difference
			const oldFormatData = JSON.stringify([
				{
					id: "old-timestamp-item",
					filepath: "old-timestamp.txt",
					data: "b2xkIHRpbWVzdGFtcA==", // base64 "old timestamp"
					type: "uploaded",
					size: 13,
					compressedSize: 8,
					timestamp: oldTimestamp, // Old single timestamp
				},
			]);

			const result = await DexieHistoryStorage.importHistory(oldFormatData);
			expect(result.success).toBe(true);
			expect(result.imported).toBe(1);

			const history = await DexieHistoryStorage.getHistory();
			expect(history[0].filepath).toBe("old-timestamp.txt");
			expect(history[0].createdAt).not.toBe(oldTimestamp); // Should be set to current time
			expect(history[0].modifiedAt).not.toBe(oldTimestamp); // Should be set to current time
			expect(history[0].createdAt).toBe(history[0].modifiedAt); // Both should be equal
			expect((history[0] as any).timestamp).toBeUndefined(); // Old timestamp should be removed
		});
	});
});
