import pako from "pako";

export interface CompressedFile {
	data: string; // base64 encoded compressed data
	filepath: string; // full file path like "foo/bar/baz.txt" or "filename.txt" for root level
	size: number;
	compressedSize: number;
	createdAt: number;
	modifiedAt: number;
}

export interface FileHistoryItem extends CompressedFile {
	id: string;
	url?: string;
}

// New interfaces for versioned file system
export interface FileSelection {
	filepath: string;
	versionId?: string; // undefined = latest version
}

export interface FileVersionInfo extends CompressedFile {
	versionId: string;
	version: number;
	isLatest: boolean;
}

// Compress file data and encode to base64
export function compressFile(file: File): Promise<CompressedFile> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();

		reader.onload = event => {
			try {
				const arrayBuffer = event.target?.result as ArrayBuffer;
				const uint8Array = new Uint8Array(arrayBuffer);

				// Compress the data
				const compressed = pako.deflate(uint8Array);

				// Convert to base64 for URL encoding
				const base64 = btoa(String.fromCharCode(...compressed));

				const now = Date.now();
				const compressedFile: CompressedFile = {
					data: base64,
					filepath: file.name,
					size: file.size,
					compressedSize: compressed.length,
					createdAt: now,
					modifiedAt: now,
				};

				resolve(compressedFile);
			} catch (error) {
				reject(new Error("Failed to compress file: " + error));
			}
		};

		reader.onerror = () => reject(new Error("Failed to read file"));
		reader.readAsArrayBuffer(file);
	});
}

// Compress file data with custom filepath
export function compressFileWithPath(file: File, filepath: string): Promise<CompressedFile> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();

		reader.onload = event => {
			try {
				const arrayBuffer = event.target?.result as ArrayBuffer;
				const uint8Array = new Uint8Array(arrayBuffer);

				// Compress the data
				const compressed = pako.deflate(uint8Array);

				// Convert to base64 for URL encoding
				const base64 = btoa(String.fromCharCode(...compressed));

				const now = Date.now();
				const compressedFile: CompressedFile = {
					data: base64,
					filepath: normalizeFilepath(filepath),
					size: file.size,
					compressedSize: compressed.length,
					createdAt: now,
					modifiedAt: now,
				};

				resolve(compressedFile);
			} catch (error) {
				reject(new Error("Failed to compress file: " + error));
			}
		};

		reader.onerror = () => reject(new Error("Failed to read file"));
		reader.readAsArrayBuffer(file);
	});
}

// Compress text content to base64
export function compressText(content: string, filepath: string): CompressedFile {
	try {
		// Convert text to bytes
		const encoder = new TextEncoder();
		const uint8Array = encoder.encode(content);

		// Compress the data
		const compressed = pako.deflate(uint8Array);

		// Convert to base64 for URL encoding
		const base64 = btoa(String.fromCharCode(...compressed));

		const now = Date.now();
		return {
			data: base64,
			filepath: filepath || "content.txt",
			size: uint8Array.length,
			compressedSize: compressed.length,
			createdAt: now,
			modifiedAt: now,
		};
	} catch (error) {
		throw new Error("Failed to compress text: " + error);
	}
}

// Decompress file data from base64
export function decompressFile(compressedFile: CompressedFile): Blob {
	try {
		// Decode from base64
		const compressed = Uint8Array.from(atob(compressedFile.data), c => c.charCodeAt(0));

		// Decompress the data
		const decompressed = pako.inflate(compressed);

		return new Blob([decompressed], { type: "application/octet-stream" });
	} catch (error) {
		throw new Error("Failed to decompress file: " + error);
	}
}

// Convert compressed file to URL-safe base64
export function fileToUrl(compressedFile: CompressedFile): string {
	// Only encode the compressed data, keep essential metadata as separate URL params
	const encodedData = encodeURIComponent(compressedFile.data);
	const params = new URLSearchParams({
		filepath: compressedFile.filepath,
		createdAt: compressedFile.createdAt.toString(),
		modifiedAt: compressedFile.modifiedAt.toString(),
		data: encodedData,
	});
	return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
}

// Parse URL to extract compressed file data
export function urlToFile(url: string): CompressedFile | null {
	try {
		const urlObj = new URL(url);
		const params = urlObj.searchParams;

		// Try newest format (separate parameters with createdAt and modifiedAt)
		const filepath = params.get("filepath");
		const createdAt = params.get("createdAt");
		const modifiedAt = params.get("modifiedAt");
		const data = params.get("data");

		if (data && filepath && createdAt && modifiedAt) {
			const decodedData = decodeURIComponent(data);

			// Calculate sizes from the actual data by decompressing
			let originalSize = 0;
			try {
				const compressed = Uint8Array.from(atob(decodedData), c => c.charCodeAt(0));
				const decompressed = pako.inflate(compressed);
				originalSize = decompressed.length;
			} catch {
				// Fallback if decompression fails
				originalSize = 0;
			}

			const compressedSize = decodedData.length;

			return {
				data: decodedData,
				filepath,
				size: originalSize,
				compressedSize,
				createdAt: parseInt(createdAt, 10),
				modifiedAt: parseInt(modifiedAt, 10),
			};
		}

		// Try old format with single timestamp
		const timestamp = params.get("timestamp");
		if (data && filepath && timestamp) {
			const decodedData = decodeURIComponent(data);
			const parsedTimestamp = parseInt(timestamp, 10);

			// Calculate sizes from the actual data by decompressing
			let originalSize = 0;
			try {
				const compressed = Uint8Array.from(atob(decodedData), c => c.charCodeAt(0));
				const decompressed = pako.inflate(compressed);
				originalSize = decompressed.length;
			} catch {
				// Fallback if decompression fails
				originalSize = 0;
			}

			const compressedSize = decodedData.length;

			return {
				data: decodedData,
				filepath,
				size: originalSize,
				compressedSize,
				createdAt: parsedTimestamp,
				modifiedAt: parsedTimestamp,
			};
		}

		// Try old format (separate parameters with name)
		const name = params.get("name");
		if (data && name && timestamp) {
			const decodedData = decodeURIComponent(data);
			const parsedTimestamp = parseInt(timestamp, 10);

			// Calculate sizes from the actual data by decompressing
			let originalSize = 0;
			try {
				const compressed = Uint8Array.from(atob(decodedData), c => c.charCodeAt(0));
				const decompressed = pako.inflate(compressed);
				originalSize = decompressed.length;
			} catch {
				// Fallback if decompression fails
				originalSize = 0;
			}

			const compressedSize = decodedData.length;

			return {
				data: decodedData,
				filepath: name, // Convert old name to filepath
				size: originalSize,
				compressedSize,
				createdAt: parsedTimestamp,
				modifiedAt: parsedTimestamp,
			};
		}

		// Fallback to old format (single JSON object)
		const dataParam = params.get("data");
		if (dataParam) {
			const decoded = decodeURIComponent(dataParam);
			const fileData = JSON.parse(decoded) as
				| CompressedFile
				| { data: string; name: string; size: number; compressedSize: number; timestamp: number }
				| { data: string; filepath: string; size: number; compressedSize: number; timestamp: number };

			// Handle new format with both timestamps
			if ("createdAt" in fileData && "modifiedAt" in fileData) {
				// Validate required fields
				if (!fileData.data || !fileData.filepath || !fileData.size) {
					throw new Error("Invalid file data format");
				}
				return fileData as CompressedFile;
			}

			// Handle format with filepath but old timestamp
			if ("filepath" in fileData && "timestamp" in fileData) {
				const oldFileData = fileData as {
					data: string;
					filepath: string;
					size: number;
					compressedSize: number;
					timestamp: number;
				};
				const timestamp = oldFileData.timestamp;
				return {
					...oldFileData,
					createdAt: timestamp,
					modifiedAt: timestamp,
				} as CompressedFile;
			}

			// Handle old format with name - convert to new format
			if (fileData.data && "name" in fileData && fileData.size) {
				const oldFileData = fileData as {
					data: string;
					name: string;
					size: number;
					compressedSize: number;
					timestamp?: number;
				};
				const timestamp = oldFileData.timestamp || Date.now();
				return {
					...oldFileData,
					filepath: oldFileData.name,
					createdAt: timestamp,
					modifiedAt: timestamp,
				} as CompressedFile;
			}

			throw new Error("Invalid file data format");
		}

		throw new Error("No valid data found in URL");
	} catch (error) {
		console.error("Failed to parse URL:", error);
		return null;
	}
}

// Download file to user's device
export function downloadFile(compressedFile: CompressedFile): void {
	const blob = decompressFile(compressedFile);
	const url = URL.createObjectURL(blob);

	const a = document.createElement("a");
	a.href = url;
	// Extract just the filename from the filepath for the download attribute
	a.download = getFilename(compressedFile.filepath);
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);

	URL.revokeObjectURL(url);
}

// Format file size for display
export function formatFileSize(bytes: number): string {
	if (bytes === 0) return "0 Bytes";

	const k = 1024;
	const sizes = ["Bytes", "KB", "MB", "GB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));

	return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

// Calculate compression ratio
export function getCompressionRatio(original: number, compressed: number): number {
	return Math.round(((original - compressed) / original) * 100);
}

// Path utilities
export function validateFilepath(filepath: string): boolean {
	// Check for invalid characters in file paths (web-safe validation)
	const invalidChars = /[<>:"|?*]/;
	if (invalidChars.test(filepath)) {
		return false;
	}

	// Check for empty string
	if (!filepath || filepath.trim() === "") {
		return false;
	}

	// Check for leading/trailing slashes or whitespace
	if (filepath.startsWith("/") || filepath.endsWith("/") || filepath !== filepath.trim()) {
		return false;
	}

	return true;
}

export function normalizeFilepath(filepath: string): string {
	// Remove leading/trailing whitespace and slashes
	let normalized = filepath.trim().replace(/^\/+|\/+$/g, "");

	// Replace multiple consecutive slashes with single slash
	normalized = normalized.replace(/\/+/g, "/");

	return normalized;
}

export function getFilepathInfo(filepath: string) {
	const parts = filepath.split("/");
	const filename = parts[parts.length - 1];
	const directory = parts.slice(0, -1).join("/");
	const extension = filename.includes(".") ? filename.split(".").pop() : "";

	return {
		filename,
		directory,
		extension,
		isRootLevel: parts.length === 1,
		depth: parts.length - 1,
	};
}

export function getFilename(filepath: string): string {
	return filepath.split("/").pop() || filepath;
}

// Compression utilities for text content
export function compressData(content: string): Uint8Array {
	const encoder = new TextEncoder();
	const uint8Array = encoder.encode(content);
	return pako.deflate(uint8Array);
}

export function decompressData(compressedData: Uint8Array): string {
	const decompressed = pako.inflate(compressedData);
	const decoder = new TextDecoder();
	return decoder.decode(decompressed);
}

export function encodeToBase64(data: Uint8Array): string {
	return btoa(String.fromCharCode(...data));
}

export function decodeFromBase64(base64: string): Uint8Array {
	return Uint8Array.from(atob(base64), c => c.charCodeAt(0));
}

export function generateShareableUrl(content: string, filepath: string): string {
	const compressedFile = compressText(content, filepath);
	return fileToUrl(compressedFile);
}
