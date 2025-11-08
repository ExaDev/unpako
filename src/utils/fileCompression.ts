import pako from "pako";

export interface CompressedFile {
	data: string; // base64 encoded compressed data
	name: string;
	size: number;
	compressedSize: number;
	timestamp: number;
}

export interface FileHistoryItem extends CompressedFile {
	id: string;
	url?: string;
	type: "uploaded" | "downloaded";
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

				const compressedFile: CompressedFile = {
					data: base64,
					name: file.name,
					size: file.size,
					compressedSize: compressed.length,
					timestamp: Date.now(),
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
	const encodedData = encodeURIComponent(JSON.stringify(compressedFile));
	return `${window.location.origin}${window.location.pathname}?data=${encodedData}`;
}

// Parse URL to extract compressed file data
export function urlToFile(url: string): CompressedFile | null {
	try {
		const urlObj = new URL(url);
		const dataParam = urlObj.searchParams.get("data");

		if (!dataParam) return null;

		const decoded = decodeURIComponent(dataParam);
		const fileData = JSON.parse(decoded) as CompressedFile;

		// Validate required fields
		if (!fileData.data || !fileData.name || !fileData.size) {
			throw new Error("Invalid file data format");
		}

		return fileData;
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
	a.download = compressedFile.name;
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
