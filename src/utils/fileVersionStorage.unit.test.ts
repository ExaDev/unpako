import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { FileVersionStorage } from "./fileVersionStorage";
import { db } from "./db";
import "fake-indexeddb/auto";

describe("FileVersionStorage", () => {
	beforeEach(async () => {
		// Clear database before each test
		await db.fileVersions.clear();
		await db.fileMetadata.clear();
		await db.fileHistory.clear();

		// Wait a bit for async operations to complete
		await new Promise(resolve => setTimeout(resolve, 10));
	});

	afterEach(async () => {
		// Clear database after each test
		await db.fileVersions.clear();
		await db.fileMetadata.clear();
		await db.fileHistory.clear();

		// Wait a bit for async operations to complete
		await new Promise(resolve => setTimeout(resolve, 10));
	});

	describe("addFileVersion", () => {
		it("should create a new file with first version", async () => {
			await FileVersionStorage.addFileVersion("test.txt", {
				size: 100,
				compressedSize: 50,
				data: "compressed-data",
				url: "test-url",
			});

			const latestFiles = await FileVersionStorage.getLatestFiles();
			expect(latestFiles).toHaveLength(1);
			expect(latestFiles[0].filepath).toBe("test.txt");
			expect(latestFiles[0].version).toBe(1);
			expect(latestFiles[0].isLatest).toBe(true);

			const metadata = await FileVersionStorage.getFileMetadata("test.txt");
			expect(metadata).toBeTruthy();
			expect(metadata!.latestVersion).toBe(1);
			expect(metadata!.totalVersions).toBe(1);
		});

		it("should add new version to existing file", async () => {
			// Add first version
			await FileVersionStorage.addFileVersion("test.txt", {
				size: 100,
				compressedSize: 50,
				data: "compressed-data-v1",
				url: "test-url-v1",
			});

			// Add second version
			await FileVersionStorage.addFileVersion("test.txt", {
				size: 200,
				compressedSize: 75,
				data: "compressed-data-v2",
				url: "test-url-v2",
			});

			const latestFiles = await FileVersionStorage.getLatestFiles();
			expect(latestFiles).toHaveLength(1);
			expect(latestFiles[0].version).toBe(2);
			expect(latestFiles[0].data).toBe("compressed-data-v2");

			const allVersions = await FileVersionStorage.getFileVersions("test.txt");
			expect(allVersions).toHaveLength(2);
			expect(allVersions[0].version).toBe(2); // Latest first
			expect(allVersions[1].version).toBe(1);

			const metadata = await FileVersionStorage.getFileMetadata("test.txt");
			expect(metadata!.totalVersions).toBe(2);
			expect(metadata!.totalSize).toBe(300); // 100 + 200
		});
	});

	describe("getFileVersions", () => {
		it("should return empty array for non-existent file", async () => {
			const versions = await FileVersionStorage.getFileVersions("non-existent.txt");
			expect(versions).toHaveLength(0);
		});

		it("should return all versions sorted by version descending", async () => {
			// Add multiple versions
			for (let i = 1; i <= 3; i++) {
				await FileVersionStorage.addFileVersion("test.txt", {
					size: 100 * i,
					compressedSize: 50 * i,
					data: `compressed-data-v${i}`,
					url: `test-url-v${i}`,
				});
			}

			const versions = await FileVersionStorage.getFileVersions("test.txt");
			expect(versions).toHaveLength(3);
			expect(versions[0].version).toBe(3);
			expect(versions[1].version).toBe(2);
			expect(versions[2].version).toBe(1);
		});
	});

	describe("revertToVersion", () => {
		it("should create new version based on target version", async () => {
			// Add original version
			await FileVersionStorage.addFileVersion("test.txt", {
				size: 100,
				compressedSize: 50,
				data: "original-data",
				url: "original-url",
			});

			// Add modified version
			await FileVersionStorage.addFileVersion("test.txt", {
				size: 200,
				compressedSize: 75,
				data: "modified-data",
				url: "modified-url",
			});

			// Revert to version 1
			await FileVersionStorage.revertToVersion("test.txt", 1);

			const latestFiles = await FileVersionStorage.getLatestFiles();
			expect(latestFiles[0].data).toBe("original-data");
			expect(latestFiles[0].version).toBe(3); // New version created

			const allVersions = await FileVersionStorage.getFileVersions("test.txt");
			expect(allVersions).toHaveLength(3);
		});

		it("should throw error for non-existent version", async () => {
			await expect(FileVersionStorage.revertToVersion("test.txt", 999)).rejects.toThrow(
				"Version 999 not found for test.txt"
			);
		});
	});

	describe("deleteFile", () => {
		it("should delete file and all versions", async () => {
			// Add file with multiple versions
			for (let i = 1; i <= 3; i++) {
				await FileVersionStorage.addFileVersion("test.txt", {
					size: 100 * i,
					compressedSize: 50 * i,
					data: `compressed-data-v${i}`,
					url: `test-url-v${i}`,
				});
			}

			// Verify file exists
			const latestFiles = await FileVersionStorage.getLatestFiles();
			expect(latestFiles).toHaveLength(1);

			// Delete file
			await FileVersionStorage.deleteFile("test.txt");

			// Verify file is deleted
			const deletedLatestFiles = await FileVersionStorage.getLatestFiles();
			expect(deletedLatestFiles).toHaveLength(0);

			const deletedVersions = await FileVersionStorage.getFileVersions("test.txt");
			expect(deletedVersions).toHaveLength(0);

			const deletedMetadata = await FileVersionStorage.getFileMetadata("test.txt");
			expect(deletedMetadata).toBeNull();
		});
	});

	describe("getStats", () => {
		it("should return correct statistics", async () => {
			// Add multiple files with versions
			await FileVersionStorage.addFileVersion("file1.txt", {
				size: 100,
				compressedSize: 50,
				data: "data1",
				url: "url1",
			});

			await FileVersionStorage.addFileVersion("file1.txt", {
				size: 150,
				compressedSize: 60,
				data: "data1-v2",
				url: "url1-v2",
			});

			await FileVersionStorage.addFileVersion("file2.txt", {
				size: 200,
				compressedSize: 80,
				data: "data2",
				url: "url2",
			});

			const stats = await FileVersionStorage.getStats();
			expect(stats.totalFiles).toBe(2);
			expect(stats.totalVersions).toBe(3);
			expect(stats.totalSize).toBe(450); // 100 + 150 + 200
			expect(stats.totalCompressedSize).toBe(190); // 50 + 60 + 80
		});

		it("should return zero stats for empty database", async () => {
			const stats = await FileVersionStorage.getStats();
			expect(stats.totalFiles).toBe(0);
			expect(stats.totalVersions).toBe(0);
			expect(stats.totalSize).toBe(0);
			expect(stats.totalCompressedSize).toBe(0);
		});
	});

	describe("compatibility methods", () => {
		it("should work with existing getHistory interface", async () => {
			await FileVersionStorage.addFileVersion("test.txt", {
				size: 100,
				compressedSize: 50,
				data: "test-data",
				url: "test-url",
			});

			const history = await FileVersionStorage.getHistory();
			expect(history).toHaveLength(1);
			expect(history[0].filepath).toBe("test.txt");
		});

		it("should work with addToHistory interface", async () => {
			await FileVersionStorage.addToHistory({
				filepath: "compat-test.txt",
				size: 100,
				compressedSize: 50,
				data: "compat-data",
				url: "compat-url",
				createdAt: Date.now(),
				modifiedAt: Date.now(),
			});

			const latestFiles = await FileVersionStorage.getLatestFiles();
			expect(latestFiles).toHaveLength(1);
			expect(latestFiles[0].filepath).toBe("compat-test.txt");
		});
	});

	describe("import/export versions", () => {
		it("should export and import versions correctly", async () => {
			// Add test data
			await FileVersionStorage.addFileVersion("export-test.txt", {
				size: 100,
				compressedSize: 50,
				data: "export-data",
				url: "export-url",
			});

			// Export
			const exportedData = await FileVersionStorage.exportVersions();
			expect(exportedData).toBeDefined();

			// Clear database
			await db.fileVersions.clear();
			await db.fileMetadata.clear();

			// Import
			const importResult = await FileVersionStorage.importVersions(exportedData);
			expect(importResult.success).toBe(true);
			expect(importResult.imported).toBe(1);

			// Verify import
			const latestFiles = await FileVersionStorage.getLatestFiles();
			expect(latestFiles).toHaveLength(1);
			expect(latestFiles[0].filepath).toBe("export-test.txt");
		});

		it("should handle invalid JSON during import", async () => {
			const result = await FileVersionStorage.importVersions("invalid-json");
			expect(result.success).toBe(false);
			expect(result.imported).toBe(0);
			expect(result.errors).toContain("Failed to parse JSON:");
		});

		it("should skip existing versions during import", async () => {
			// Add original version
			await FileVersionStorage.addFileVersion("duplicate-test.txt", {
				size: 100,
				compressedSize: 50,
				data: "original-data",
				url: "original-url",
			});

			// Export
			const exportedData = await FileVersionStorage.exportVersions();

			// Try to import same data
			const result = await FileVersionStorage.importVersions(exportedData);
			expect(result.imported).toBe(0); // Should skip existing versions
		});
	});
});
