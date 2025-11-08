import type { FileHistoryItem } from './fileCompression';

const STORAGE_KEY = 'unpako-history';
const MAX_HISTORY_ITEMS = 50;

export class HistoryStorage {
	// Get all history items
	static getHistory(): FileHistoryItem[] {
		try {
			const stored = localStorage.getItem(STORAGE_KEY);
			return stored ? JSON.parse(stored) : [];
		} catch (error) {
			console.error('Failed to load history:', error);
			return [];
		}
	}

	// Add new item to history
	static addToHistory(item: Omit<FileHistoryItem, 'id'>): void {
		try {
			const history = this.getHistory();
			const newItem: FileHistoryItem = {
				...item,
				id: this.generateId(),
			};

			// Add to beginning of array
			history.unshift(newItem);

			// Limit history size
			if (history.length > MAX_HISTORY_ITEMS) {
				history.splice(MAX_HISTORY_ITEMS);
			}

			localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
		} catch (error) {
			console.error('Failed to save to history:', error);
		}
	}

	// Remove item from history
	static removeFromHistory(id: string): void {
		try {
			const history = this.getHistory();
			const filtered = history.filter(item => item.id !== id);
			localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
		} catch (error) {
			console.error('Failed to remove from history:', error);
		}
	}

	// Clear all history
	static clearHistory(): void {
		try {
			localStorage.removeItem(STORAGE_KEY);
		} catch (error) {
			console.error('Failed to clear history:', error);
		}
	}

	// Get specific history item by ID
	static getHistoryItem(id: string): FileHistoryItem | null {
		const history = this.getHistory();
		return history.find(item => item.id === id) || null;
	}

	// Update history item
	static updateHistoryItem(id: string, updates: Partial<FileHistoryItem>): void {
		try {
			const history = this.getHistory();
			const index = history.findIndex(item => item.id === id);

			if (index !== -1) {
				history[index] = { ...history[index], ...updates };
				localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
			}
		} catch (error) {
			console.error('Failed to update history item:', error);
		}
	}

	// Get statistics
	static getStats(): {
    totalItems: number;
    totalSize: number;
    totalCompressedSize: number;
    uploadedCount: number;
    downloadedCount: number;
    } {
		const history = this.getHistory();

		return {
			totalItems: history.length,
			totalSize: history.reduce((sum, item) => sum + item.size, 0),
			totalCompressedSize: history.reduce((sum, item) => sum + item.compressedSize, 0),
			uploadedCount: history.filter(item => item.type === 'uploaded').length,
			downloadedCount: history.filter(item => item.type === 'downloaded').length,
		};
	}

	// Generate unique ID
	private static generateId(): string {
		return Date.now().toString(36) + Math.random().toString(36).substr(2);
	}

	// Export history as JSON
	static exportHistory(): string {
		const history = this.getHistory();
		return JSON.stringify(history, null, 2);
	}

	// Import history from JSON
	static importHistory(jsonData: string): { success: boolean; imported: number; errors: string[] } {
		const errors: string[] = [];
		let imported = 0;

		try {
			const data = JSON.parse(jsonData);

			if (!Array.isArray(data)) {
				errors.push('Invalid format: Expected array');
				return { success: false, imported: 0, errors };
			}

			const existingHistory = this.getHistory();
			const existingIds = new Set(existingHistory.map(item => item.id));

			for (const item of data) {
				try {
					// Validate item structure
					if (!item.id || !item.name || !item.data || !item.type) {
						errors.push(`Invalid item: Missing required fields`);
						continue;
					}

					if (item.type !== 'uploaded' && item.type !== 'downloaded') {
						errors.push(`Invalid item: Invalid type "${item.type}"`);
						continue;
					}

					// Skip if already exists
					if (existingIds.has(item.id)) {
						continue;
					}

					existingHistory.unshift(item);
					imported++;
				} catch (error) {
					errors.push(`Failed to process item: ${error}`);
				}
			}

			if (imported > 0) {
				// Limit history size
				if (existingHistory.length > MAX_HISTORY_ITEMS) {
					existingHistory.splice(MAX_HISTORY_ITEMS);
				}

				localStorage.setItem(STORAGE_KEY, JSON.stringify(existingHistory));
			}
		} catch (error) {
			errors.push(`Failed to parse JSON: ${error}`);
		}

		return {
			success: imported > 0 && errors.length === 0,
			imported,
			errors
		};
	}
}