import type { FileVersion, FileMetadata } from "./db";
import { db, safeDbOperation } from "./db";
import type { CompressedFile } from "./fileCompression";

export class FileVersionStorage {
	// Get latest version of all files (for file tree)
	static async getLatestFiles(): Promise<FileVersion[]> {
		const items = await safeDbOperation(async () => {
			return await db.fileVersions.where("isLatest").equals(true).toArray();
		});
		return items || [];
	}

	// Get all versions of a specific file
	static async getFileVersions(filepath: string): Promise<FileVersion[]> {
		const items = await safeDbOperation(async () => {
			return await db.fileVersions.where("filepath").equals(filepath).reverse().toArray();
		});
		return items || [];
	}

	// Get specific version of a file
	static async getFileVersion(filepath: string, versionId: string): Promise<FileVersion | null> {
		return safeDbOperation(async () => {
			return await db.fileVersions
				.where("versionId")
				.equals(versionId)
				.and(item => item.filepath === filepath)
				.first();
		});
	}

	// Get latest version of a specific file
	static async getLatestFileVersion(filepath: string): Promise<FileVersion | null> {
		return safeDbOperation(async () => {
			return await db.fileVersions.where({ filepath, isLatest: true }).first();
		});
	}

	// Get file metadata
	static async getFileMetadata(filepath: string): Promise<FileMetadata | null> {
		return safeDbOperation(async () => {
			return await db.fileMetadata.get(filepath);
		});
	}

	// Get all file metadata
	static async getAllFileMetadata(): Promise<FileMetadata[]> {
		const items = await safeDbOperation(async () => {
			return await db.fileMetadata.toArray();
		});
		return items || [];
	}

	// Add new version to existing file or create new file
	static async addFileVersion(
		filepath: string,
		version: Omit<FileVersion, "filepath" | "versionId" | "version" | "createdAt" | "isLatest">
	): Promise<void> {
		await safeDbOperation(async () => {
			const now = Date.now();
			const versionId = this.generateVersionId();

			// Get current metadata
			const metadata = await db.fileMetadata.get(filepath);

			if (metadata) {
				// Update existing file with new version
				const newVersionNumber = metadata.latestVersion + 1;

				// Mark old latest as not latest
				await db.fileVersions
					.where("versionId")
					.equals(metadata.latestVersionId)
					.modify({ isLatest: false });

				// Add new version
				await db.fileVersions.add({
					filepath,
					versionId,
					version: newVersionNumber,
					...version,
					createdAt: now,
					isLatest: true,
				});

				// Update metadata
				await db.fileMetadata.update(filepath, {
					latestVersion: newVersionNumber,
					latestVersionId: versionId,
					totalVersions: metadata.totalVersions + 1,
					lastModifiedAt: now,
					totalSize: metadata.totalSize + version.size,
					totalCompressedSize: metadata.totalCompressedSize + version.compressedSize,
				});
			} else {
				// Create new file
				await db.fileVersions.add({
					filepath,
					versionId,
					version: 1,
					...version,
					createdAt: now,
					isLatest: true,
				});

				await db.fileMetadata.add({
					filepath,
					latestVersion: 1,
					latestVersionId: versionId,
					totalVersions: 1,
					originalCreatedAt: now,
					lastModifiedAt: now,
					totalSize: version.size,
					totalCompressedSize: version.compressedSize,
				});
			}
		});
	}

	// Revert file to specific version
	static async revertToVersion(filepath: string, targetVersion: number): Promise<void> {
		await safeDbOperation(async () => {
			const targetVersionData = await db.fileVersions
				.where("version")
				.equals(targetVersion)
				.and(item => item.filepath === filepath)
				.first();

			if (!targetVersionData) {
				throw new Error(`Version ${targetVersion} not found for ${filepath}`);
			}

			// Create new version based on target version data
			await this.addFileVersion(filepath, {
				size: targetVersionData.size,
				compressedSize: targetVersionData.compressedSize,
				data: targetVersionData.data,
				url: targetVersionData.url,
			});
		});
	}

	// Delete file and all versions
	static async deleteFile(filepath: string): Promise<void> {
		await safeDbOperation(async () => {
			const versionsToDelete = await db.fileVersions.where("filepath").equals(filepath).toArray();

			const versionIds = versionsToDelete.map(v => v.versionId);
			await db.fileVersions.bulkDelete(versionIds);
			await db.fileMetadata.delete(filepath);
		});
	}

	// Get statistics for versioned system
	static async getStats(): Promise<{
		totalFiles: number;
		totalVersions: number;
		totalSize: number;
		totalCompressedSize: number;
	}> {
		const metadata = await this.getAllFileMetadata();

		return {
			totalFiles: metadata.length,
			totalVersions: metadata.reduce((sum, item) => sum + item.totalVersions, 0),
			totalSize: metadata.reduce((sum, item) => sum + item.totalSize, 0),
			totalCompressedSize: metadata.reduce((sum, item) => sum + item.totalCompressedSize, 0),
		};
	}

	// Export versions as JSON
	static async exportVersions(filepaths?: string[]): Promise<string> {
		const versions: FileVersion[] = [];

		if (filepaths && filepaths.length > 0) {
			// Export only specified files
			for (const filepath of filepaths) {
				const fileVersions = await this.getFileVersions(filepath);
				versions.push(...fileVersions);
			}
		} else {
			// Export all versions
			const allVersions = await safeDbOperation(async () => {
				return await db.fileVersions.toArray();
			});
			if (allVersions) {
				versions.push(...allVersions);
			}
		}

		return JSON.stringify(versions, null, 2);
	}

	// Import versions from JSON
	static async importVersions(
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

				// Group versions by filepath
				const fileGroups = data.reduce(
					(groups, version) => {
						if (!version.filepath || !version.versionId || !version.data) {
							errors.push(`Invalid version: Missing required fields`);
							return groups;
						}

						if (!groups[version.filepath]) {
							groups[version.filepath] = [];
						}
						groups[version.filepath].push(version);
						return groups;
					},
					{} as Record<string, (FileVersion & { version?: number })[]>
				);

				// Process each file
				for (const [filepath, versions] of Object.entries(fileGroups)) {
					// Sort by version number to ensure correct order
					versions.sort((a, b) => (a.version || 1) - (b.version || 1));

					for (const version of versions) {
						// Check if version already exists
						const existing = await this.getFileVersion(filepath, version.versionId);
						if (existing) {
							continue; // Skip existing versions
						}

						// Add the version
						await this.addFileVersion(filepath, {
							size: version.size,
							compressedSize: version.compressedSize,
							data: version.data,
							url: version.url,
						});

						imported++;
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

	// Compatibility methods with existing FileHistoryItem interface
	static async getHistory(): Promise<FileVersion[]> {
		return this.getLatestFiles();
	}

	static async addToHistory(item: Omit<CompressedFile, "filepath">): Promise<void> {
		// For compatibility, generate a filepath if not provided
		const filepath = item.filepath || `untitled/${Date.now()}`;

		await this.addFileVersion(filepath, {
			size: item.size,
			compressedSize: item.compressedSize,
			data: item.data,
			url: item.url,
		});
	}

	// Legacy compatibility method
	static async getAllItems(): Promise<FileVersion[]> {
		return this.getLatestFiles();
	}

	static async deleteItem(versionId: string): Promise<void> {
		await safeDbOperation(async () => {
			// Find the file version
			const version = await db.fileVersions.get(versionId);
			if (!version) {
				throw new Error(`Version ${versionId} not found`);
			}

			// Check if it's the latest version
			if (version.isLatest) {
				// Need to promote the previous version to latest
				const previousVersions = await db.fileVersions
					.where("filepath")
					.equals(version.filepath)
					.and(v => v.version < version.version)
					.reverse()
					.toArray();

				if (previousVersions.length > 0) {
					// Promote previous version to latest
					const newLatest = previousVersions[0];
					await db.fileVersions.update(versionId, { isLatest: false });
					await db.fileVersions.update(newLatest.versionId, { isLatest: true });

					// Update metadata
					await db.fileMetadata.update(version.filepath, {
						latestVersion: newLatest.version,
						latestVersionId: newLatest.versionId,
						totalVersions: (await db.fileMetadata.get(version.filepath))!.totalVersions - 1,
						lastModifiedAt: Date.now(),
						totalSize: (await db.fileMetadata.get(version.filepath))!.totalSize - version.size,
						totalCompressedSize:
							(await db.fileMetadata.get(version.filepath))!.totalCompressedSize - version.compressedSize,
					});
				} else {
					// This was the only version, delete the entire file
					await this.deleteFile(version.filepath);
					return;
				}
			}

			// Delete the version
			await db.fileVersions.delete(versionId);
		});
	}

	// Legacy compatibility: update item by creating new version
	static async addItem(item: FileVersion & { version?: number }): Promise<void> {
		await this.addFileVersion(item.filepath, {
			size: item.size,
			compressedSize: item.compressedSize,
			data: item.data,
			url: item.url,
		});
	}

	private static generateVersionId(): string {
		return Date.now().toString(36) + Math.random().toString(36).substr(2);
	}
}
