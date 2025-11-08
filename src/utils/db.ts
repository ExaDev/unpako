import Dexie, { type Table } from "dexie";
import type { FileHistoryItem } from "./fileCompression";

// Re-export FileHistoryItem for convenience
export type { FileHistoryItem } from "./fileCompression";

// New interfaces for versioned file system
export interface FileVersion {
	filepath: string;
	versionId: string;
	version: number;
	size: number;
	compressedSize: number;
	createdAt: number;
	data: string;
	url?: string;
	isLatest: boolean;
}

export interface FileMetadata {
	filepath: string;
	latestVersion: number;
	latestVersionId: string;
	totalVersions: number;
	originalCreatedAt: number;
	lastModifiedAt: number;
	totalSize: number;
	totalCompressedSize: number;
}

// Database class for Unpako file history
export class UnpakoDB extends Dexie {
	fileHistory!: Table<FileHistoryItem>;
	fileVersions!: Table<FileVersion>;
	fileMetadata!: Table<FileMetadata>;

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

		// Version 3: Remove type field (simplified schema)
		this.version(3)
			.stores({
				fileHistory: "++id, filepath, size, compressedSize, createdAt, modifiedAt, url",
			})
			.upgrade(tx => {
				// Migration: Remove type field from existing records
				return tx
					.table("fileHistory")
					.toCollection()
					.modify(file => {
						// Remove the type property from existing records
						delete (file as FileHistoryItem & { type?: string }).type;
					});
			});

		// Version 4: Add file versioning support
		this.version(4)
			.stores({
				fileHistory: "++id, filepath, size, compressedSize, createdAt, modifiedAt, url",
				fileVersions: "++versionId, [filepath+versionId], filepath, version, createdAt, isLatest",
				fileMetadata: "&filepath, latestVersion, lastModifiedAt",
			})
			.upgrade(async tx => {
				// Migration: Convert flat file history to versioned system
				const oldItems = await tx.table("fileHistory").toArray();

				// Group by filepath
				const fileGroups = (oldItems as FileHistoryItem[]).reduce(
					(groups, item) => {
						const filepath = item.filepath || `unnamed/${item.id}`;
						if (!groups[filepath]) {
							groups[filepath] = [];
						}
						groups[filepath].push(item);
						return groups;
					},
					{} as Record<string, FileHistoryItem[]>
				);

				// Create versions for each filepath
				for (const [filepath, items] of Object.entries(fileGroups)) {
					// Sort by modifiedAt descending to get latest first
					items.sort((a, b) => b.modifiedAt - a.modifiedAt);

					const metadata: FileMetadata = {
						filepath,
						latestVersion: items.length,
						latestVersionId: items[0].id,
						totalVersions: items.length,
						originalCreatedAt: Math.min(...items.map(item => item.createdAt)),
						lastModifiedAt: Math.max(...items.map(item => item.modifiedAt)),
						totalSize: items.reduce((sum, item) => sum + item.size, 0),
						totalCompressedSize: items.reduce((sum, item) => sum + item.compressedSize, 0),
					};

					await tx.table("fileMetadata").add(metadata);

					// Create versions (reverse order: oldest first)
					items.reverse().forEach((item, index) => {
						const version: FileVersion = {
							filepath,
							versionId: item.id,
							version: index + 1,
							size: item.size,
							compressedSize: item.compressedSize,
							createdAt: item.createdAt,
							data: item.data,
							url: item.url,
							isLatest: index === items.length - 1, // Last one is latest
						};
						tx.table("fileVersions").add(version);
					});
				}
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
