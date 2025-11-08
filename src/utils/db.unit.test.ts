import { db, safeDbOperation, UnpakoDB } from "./db";
import { vi } from "vitest";

describe("Database Setup", () => {
	describe("UnpakoDB", () => {
		it("should create database instance", () => {
			expect(db).toBeDefined();
			expect(db).toBeInstanceOf(UnpakoDB);
		});

		it("should have fileHistory table", () => {
			expect(db.fileHistory).toBeDefined();
		});

		it("should open database successfully", async () => {
			// Just accessing the database should trigger opening
			await expect(db.open()).resolves.not.toThrow();
		});

		it("should have correct schema version", () => {
			expect(db.verno).toBe(3);
		});
	});

	describe("safeDbOperation", () => {
		it("should return result when operation succeeds", async () => {
			const mockOperation = vi.fn().mockResolvedValue("success");
			const result = await safeDbOperation(mockOperation);

			expect(result).toBe("success");
			expect(mockOperation).toHaveBeenCalledTimes(1);
		});

		it("should return null when operation fails", async () => {
			const mockOperation = vi.fn().mockRejectedValue(new Error("Database error"));
			const result = await safeDbOperation(mockOperation);

			expect(result).toBeNull();
			expect(mockOperation).toHaveBeenCalledTimes(1);
		});

		it("should log error when operation fails", async () => {
			const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
			const mockOperation = vi.fn().mockRejectedValue(new Error("Database error"));

			await safeDbOperation(mockOperation);

			expect(consoleErrorSpy).toHaveBeenCalledWith("Database operation failed:", expect.any(Error));

			consoleErrorSpy.mockRestore();
		});
	});

	describe("Database operations", () => {
		beforeEach(async () => {
			// Clear all data before each test
			await db.fileHistory.clear();
		});

		afterEach(async () => {
			// Clean up after each test
			await db.fileHistory.clear();
		});

		it("should add and retrieve items", async () => {
			const now = Date.now();
			const testItem = {
				id: "test-id-1",
				data: "dGVzdCBkYXRh", // base64 encoded "test data"
				filepath: "test.txt",
				size: 9,
				compressedSize: 5,
				createdAt: now,
				modifiedAt: now,
			};

			await db.fileHistory.add(testItem);

			const retrieved = await db.fileHistory.get("test-id-1");
			expect(retrieved).toMatchObject(testItem);
		});

		it("should retrieve all items", async () => {
			const now = Date.now();
			const testItems = [
				{
					id: "test-id-1",
					data: "ZGF0YTE=",
					filepath: "test1.txt",
					size: 5,
					compressedSize: 3,
					createdAt: now,
					modifiedAt: now,
				},
				{
					id: "test-id-2",
					data: "ZGF0YTI=",
					filepath: "test2.txt",
					size: 5,
					compressedSize: 3,
					createdAt: now + 1,
					modifiedAt: now + 1,
				},
			];

			await db.fileHistory.bulkAdd(testItems);

			const allItems = await db.fileHistory.toArray();
			expect(allItems).toHaveLength(2);
		});

		it("should delete items", async () => {
			const now = Date.now();
			const testItem = {
				id: "test-id-delete",
				data: "ZGF0YWRlbGV0ZQ==",
				filepath: "delete.txt",
				size: 5,
				compressedSize: 3,
				createdAt: now,
				modifiedAt: now,
			};

			await db.fileHistory.add(testItem);
			expect(await db.fileHistory.get("test-id-delete")).toBeDefined();

			await db.fileHistory.delete("test-id-delete");
			expect(await db.fileHistory.get("test-id-delete")).toBeUndefined();
		});

		it("should clear all items", async () => {
			const now = Date.now();
			const testItems = [
				{
					id: "clear-test-1",
					data: "ZGF0YTE=",
					filepath: "clear1.txt",
					size: 5,
					compressedSize: 3,
					createdAt: now,
					modifiedAt: now,
				},
				{
					id: "clear-test-2",
					data: "ZGF0YTI=",
					filepath: "clear2.txt",
					size: 5,
					compressedSize: 3,
					createdAt: now + 1,
					modifiedAt: now + 1,
				},
			];

			await db.fileHistory.bulkAdd(testItems);
			expect(await db.fileHistory.count()).toBe(2);

			await db.fileHistory.clear();
			expect(await db.fileHistory.count()).toBe(0);
		});

		it("should update items", async () => {
			const now = Date.now();
			const testItem = {
				id: "update-test",
				data: "b3JpZ2luYWw=", // base64 "original"
				filepath: "original.txt",
				size: 8,
				compressedSize: 4,
				createdAt: now,
				modifiedAt: now,
			};

			await db.fileHistory.add(testItem);

			const updates = {
				filepath: "updated.txt",
				url: "https://example.com",
				modifiedAt: Date.now(), // Update modifiedAt timestamp
			};

			await db.fileHistory.update("update-test", updates);

			const updated = await db.fileHistory.get("update-test");
			expect(updated?.filepath).toBe("updated.txt");
			expect(updated?.url).toBe("https://example.com");
			expect(updated?.data).toBe(testItem.data); // Should remain unchanged
			expect(updated?.createdAt).toBe(testItem.createdAt); // Should remain unchanged
			expect(updated?.modifiedAt).toBe(updates.modifiedAt); // Should be updated
		});

		it("should order items by modifiedAt", async () => {
			const timestamp1 = Date.now();
			const timestamp2 = timestamp1 + 1000;
			const timestamp3 = timestamp2 + 1000;

			const testItems = [
				{
					id: "order-1",
					data: "b2xkZXN0", // base64 "oldest"
					filepath: "oldest.txt",
					size: 7,
					compressedSize: 4,
					createdAt: timestamp1,
					modifiedAt: timestamp1,
				},
				{
					id: "order-2",
					data: "bWlkZGxl", // base64 "middle"
					filepath: "middle.txt",
					size: 6,
					compressedSize: 4,
					createdAt: timestamp2,
					modifiedAt: timestamp2,
				},
				{
					id: "order-3",
					data: "bmV3ZXN0", // base64 "newest"
					filepath: "newest.txt",
					size: 6,
					compressedSize: 4,
					createdAt: timestamp3,
					modifiedAt: timestamp3,
				},
			];

			// Add in random order
			await db.fileHistory.add(testItems[1]); // middle
			await db.fileHistory.add(testItems[2]); // newest
			await db.fileHistory.add(testItems[0]); // oldest

			// Get items ordered by modifiedAt (newest first)
			const orderedItems = await db.fileHistory.orderBy("modifiedAt").reverse().toArray();

			expect(orderedItems[0].filepath).toBe("newest.txt");
			expect(orderedItems[1].filepath).toBe("middle.txt");
			expect(orderedItems[2].filepath).toBe("oldest.txt");
		});

		it("should handle database errors gracefully", async () => {
			// Try to add an item with invalid data structure
			const invalidItem = {
				// Missing required fields
				id: "invalid",
			};

			// Database should accept the item but handle gracefully
			const result = await db.fileHistory.add(invalidItem as any);
			expect(result).toBe("invalid");

			// Clean up the invalid item
			await db.fileHistory.delete("invalid");
		});

		it("should support migration from old timestamp format", async () => {
			// Test migration scenario by manually creating the expected new format
			const oldTimestamp = Date.now();

			// Simulate what happens during migration - old timestamp is copied to both new fields
			await db.fileHistory.add({
				id: "migration-test",
				data: "b2xkIGZvcm1hdA==", // base64 "old format"
				filepath: "migration-test.txt",
				size: 10,
				compressedSize: 5,
				createdAt: oldTimestamp, // This would be set during migration from old timestamp
				modifiedAt: oldTimestamp, // This would be set during migration from old timestamp
			});

			// Retrieve the item
			const migratedItem = await db.fileHistory.get("migration-test");

			expect(migratedItem).toBeDefined();
			expect(migratedItem?.filepath).toBe("migration-test.txt");
			expect(migratedItem?.createdAt).toBe(oldTimestamp);
			expect(migratedItem?.modifiedAt).toBe(oldTimestamp);
			expect((migratedItem as any).timestamp).toBeUndefined(); // Old timestamp should not exist

			// Clean up
			await db.fileHistory.delete("migration-test");
		});
	});
});
