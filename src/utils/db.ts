import Dexie, { type Table } from "dexie";
import type { FileHistoryItem } from "./fileCompression";

// Interface for legacy items with old timestamp field
interface LegacyFileHistoryItem {
	id?: string;
	filepath: string;
	size: number;
	compressedSize: number;
	timestamp: number;
	type: "uploaded" | "downloaded";
	url?: string;
}

// Database class for Unpako file history
export class UnpakoDB extends Dexie {
	fileHistory!: Table<FileHistoryItem>;

	constructor() {
		super("unpako-database");

		// Define database schema with migration support
		this.version(1).stores({
			fileHistory: "++id, filepath, size, compressedSize, timestamp, type, url",
		});

		// Version 2: Replace timestamp with createdAt and modifiedAt
		this.version(2)
			.stores({
				fileHistory: "++id, filepath, size, compressedSize, createdAt, modifiedAt, type, url",
			})
			.upgrade(tx => {
				// Migration: Convert single timestamp to createdAt and modifiedAt
				return tx
					.table("fileHistory")
					.toCollection()
					.modify(file => {
						const legacyFile = file as LegacyFileHistoryItem & FileHistoryItem;
						// Set both createdAt and modifiedAt to current time for existing files
						const now = Date.now();
						legacyFile.createdAt = now;
						legacyFile.modifiedAt = now;
						// Remove old timestamp field
						delete legacyFile.timestamp;
					});
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
