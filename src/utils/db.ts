import Dexie, { type Table } from "dexie";
import type { FileHistoryItem } from "./fileCompression";

// Database class for Unpako file history
export class UnpakoDB extends Dexie {
	fileHistory!: Table<FileHistoryItem>;

	constructor() {
		super("unpako-database");

		// Define database schema
		this.version(1).stores({
			fileHistory: "++id, filepath, size, compressedSize, timestamp, type, url",
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
