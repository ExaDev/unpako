import Dexie, { type Table } from "dexie";
import type { FileHistoryItem } from "./fileCompression";

// Re-export FileHistoryItem for convenience
export type { FileHistoryItem } from "./fileCompression";

// Database class for Unpako file history
export class UnpakoDB extends Dexie {
	fileHistory!: Table<FileHistoryItem>;

	constructor() {
		super("unpako-database");

		// Define database schema with migration support
		this.version(1).stores({
			fileHistory: "++id, filepath, size, compressedSize, timestamp, type, url",
		});

		// Version 2: Use createdAt and modifiedAt schema
		this.version(2).stores({
			fileHistory: "++id, filepath, size, compressedSize, createdAt, modifiedAt, type, url",
		});
	}
}

// Create and export a single database instance
export const db = new UnpakoDB();

// Database utility functions for error handling
export async function safeDbOperation<T>(operation: () => Promise<T>): Promise<T | null> {
	try {
		return await operation();
	} catch (error) {
		console.error("Database operation failed:", error);
		return null;
	}
}
