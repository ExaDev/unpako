import type { FileHistoryItem } from "./fileCompression";
import { db, safeDbOperation } from "./db";

const MAX_HISTORY_ITEMS = 50;

export class DexieHistoryStorage {
	// Get all history items
	static async getHistory(): Promise<FileHistoryItem[]> {
		const items = await safeDbOperation(async () => {
			const results = await db.fileHistory.orderBy("modifiedAt").reverse().toArray();
			return results;
		});
		return items || [];
	}

	// Add new item to history
	static async addToHistory(item: Omit<FileHistoryItem, "id">): Promise<void> {
		await safeDbOperation(async () => {
			const newItem: FileHistoryItem = {
				...item,
				id: this.generateId(),
			};

			// Add to database (Dexie will handle ordering by modifiedAt)
			await db.fileHistory.add(newItem);

			// Limit history size by removing oldest items (by createdAt)
			const count = await db.fileHistory.count();
			if (count > MAX_HISTORY_ITEMS) {
				const excessCount = count - MAX_HISTORY_ITEMS;
				const oldestItems = await db.fileHistory.orderBy("createdAt").limit(excessCount).toArray();
				const oldestIds = oldestItems.map(item => item.id);
				await db.fileHistory.bulkDelete(oldestIds);
			}
		});
	}

	// Remove item from history
	static async removeFromHistory(id: string): Promise<void> {
		await safeDbOperation(async () => {
			await db.fileHistory.delete(id);
		});
	}

	// Clear all history
	static async clearHistory(): Promise<void> {
		await safeDbOperation(async () => {
			await db.fileHistory.clear();
		});
	}

	// Get specific history item by ID
	static async getHistoryItem(id: string): Promise<FileHistoryItem | null> {
		return safeDbOperation(async () => {
			const item = await db.fileHistory.get(id);
			return item || null;
		});
	}

	// Update history item
	static async updateHistoryItem(id: string, updates: Partial<FileHistoryItem>): Promise<void> {
		await safeDbOperation(async () => {
			const item = await db.fileHistory.get(id);
			if (item) {
				// When updating, set modifiedAt to current time unless it's being explicitly set
				const updatedItem = {
					...item,
					...updates,
					modifiedAt: updates.modifiedAt || Date.now(),
				};
				await db.fileHistory.update(id, updatedItem);
			}
		});
	}

	// Get statistics
	static async getStats(): Promise<{
		totalItems: number;
		totalSize: number;
		totalCompressedSize: number;
		uploadedCount: number;
		downloadedCount: number;
	}> {
		const history = await this.getHistory();

		return {
			totalItems: history.length,
			totalSize: history.reduce((sum, item) => sum + item.size, 0),
			totalCompressedSize: history.reduce((sum, item) => sum + item.compressedSize, 0),
			uploadedCount: history.filter(item => item.type === "uploaded").length,
			downloadedCount: history.filter(item => item.type === "downloaded").length,
		};
	}

	// Generate unique ID
	private static generateId(): string {
		return Date.now().toString(36) + Math.random().toString(36).substr(2);
	}

	// Export history as JSON
	static async exportHistory(): Promise<string> {
		const history = await this.getHistory();
		return JSON.stringify(history, null, 2);
	}

	// Import history from JSON
	static async importHistory(
		jsonData: string
	): Promise<{ success: boolean; imported: number; errors: string[] }> {
		const errors: string[] = [];
		let imported = 0;

		await safeDbOperation(async () => {
			try {
				const data = JSON.parse(jsonData);

				if (!Array.isArray(data)) {
					errors.push("Invalid format: Expected array");
					return;
				}

				const existingHistory = await this.getHistory();
				const existingIds = new Set(existingHistory.map(item => item.id));

				const itemsToAdd: FileHistoryItem[] = [];

				for (const item of data) {
					try {
						// Validate item structure (support both new filepath and old name for compatibility)
						if (!item.id || (!item.filepath && !item.name) || !item.data || !item.type) {
							errors.push(`Invalid item: Missing required fields`);
							continue;
						}

						if (item.type !== "uploaded" && item.type !== "downloaded") {
							errors.push(`Invalid item: Invalid type "${item.type}"`);
							continue;
						}

						// Skip if already exists
						if (existingIds.has(item.id)) {
							continue;
						}

						// Migrate old items with name to filepath
						if (item.name && !item.filepath) {
							item.filepath = item.name;
							item.name = undefined;
						}

						// Migrate old timestamp to createdAt and modifiedAt
						if (item.timestamp && !item.createdAt && !item.modifiedAt) {
							const now = Date.now();
							item.createdAt = now;
							item.modifiedAt = now;
							item.timestamp = undefined;
						}

						itemsToAdd.push(item as FileHistoryItem);
						imported++;
					} catch (error) {
						errors.push(`Failed to process item: ${error}`);
					}
				}

				if (itemsToAdd.length > 0) {
					// Add items to database
					await db.fileHistory.bulkAdd(itemsToAdd);

					// Ensure we don't exceed the maximum
					const totalCount = await db.fileHistory.count();
					if (totalCount > MAX_HISTORY_ITEMS) {
						const excessCount = totalCount - MAX_HISTORY_ITEMS;
						const oldestItems = await db.fileHistory.orderBy("createdAt").limit(excessCount).toArray();
						const oldestIds = oldestItems.map(item => item.id);
						await db.fileHistory.bulkDelete(oldestIds);
					}
				}
			} catch (error) {
				errors.push(`Failed to parse JSON: ${error}`);
			}
		});

		return {
			success: imported > 0 && errors.length === 0,
			imported,
			errors,
		};
	}
}
