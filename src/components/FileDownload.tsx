import { useState, useEffect, useCallback } from "react";
import { Button, Text, Group, Stack, Alert, TextInput, Card, Badge } from "@mantine/core";
import {
	IconDownload,
	IconLink,
	IconLoader,
	IconFileText,
	IconCalendar,
} from "@tabler/icons-react";
import {
	urlToFile,
	downloadFile,
	formatFileSize,
	getCompressionRatio,
} from "../utils/fileCompression";
import { HistoryStorage } from "../utils/historyStorage";
import type { CompressedFile } from "../utils/fileCompression";

interface FileDownloadProps {
	onFileDownloaded: (compressedFile: CompressedFile) => void;
}

export function FileDownload({ onFileDownloaded }: FileDownloadProps) {
	const [urlInput, setUrlInput] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [downloadReady, setDownloadReady] = useState<CompressedFile | null>(null);
	const [error, setError] = useState<string | null>(null);

	const handleUrlProcess = useCallback(async (url: string) => {
		setIsLoading(true);
		setError(null);
		setDownloadReady(null);

		try {
			const compressedFile = urlToFile(url);

			if (!compressedFile) {
				setError("Invalid URL or no file data found in URL");
				return;
			}

			// Validate the compressed data
			if (!compressedFile.data || !compressedFile.filepath) {
				setError("Corrupted file data in URL");
				return;
			}

			setDownloadReady(compressedFile);

			// Update URL input if it was from page load
			setUrlInput(url);
		} catch (error) {
			setError(error instanceof Error ? error.message : "Failed to process URL");
		} finally {
			setIsLoading(false);
		}
	}, []);

	// Check URL on component mount for initial load
	useEffect(() => {
		const currentUrl = window.location.href;
		if (currentUrl.includes("?data=")) {
			handleUrlProcess(currentUrl);
		}
	}, [handleUrlProcess]);

	const handleUrlSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!urlInput.trim()) return;

		handleUrlProcess(urlInput.trim());
	};

	const handleDownload = () => {
		if (!downloadReady) return;

		try {
			downloadFile(downloadReady);

			// Add to history
			HistoryStorage.addToHistory({
				...downloadReady,
				url: urlInput,
				type: "downloaded",
			});

			onFileDownloaded(downloadReady);
		} catch (error) {
			setError(error instanceof Error ? error.message : "Download failed");
		}
	};

	const handleClear = () => {
		setUrlInput("");
		setDownloadReady(null);
		setError(null);

		// Clear URL if it was set from page load
		if (window.location.href.includes("?data=")) {
			window.history.pushState({}, "", window.location.pathname);
		}
	};

	return (
		<Card shadow="sm" withBorder p="lg">
			<form onSubmit={handleUrlSubmit}>
				<Stack gap="md">
					<TextInput
						label="Paste sharing URL or enter URL manually"
						placeholder="https://yoursite.com/?data=..."
						value={urlInput}
						onChange={e => setUrlInput(e.target.value)}
						disabled={isLoading}
						size="md"
					/>

					<Group>
						<Button
							type="submit"
							loading={isLoading}
							disabled={!urlInput.trim() || isLoading}
							leftSection={isLoading ? <IconLoader size={16} /> : <IconLink size={16} />}
						>
							{isLoading ? "Processing URL..." : "Process URL"}
						</Button>

						{urlInput && (
							<Button variant="outline" onClick={handleClear} disabled={isLoading}>
								Clear
							</Button>
						)}
					</Group>
				</Stack>
			</form>

			{error && (
				<Alert color="red" title="Error" mt="md">
					{error}
				</Alert>
			)}

			{downloadReady && (
				<Stack gap="md" mt="md">
					<Alert color="green" title="File Ready!">
						File successfully decompressed and ready for download.
					</Alert>

					<Card withBorder p="md" bg="green.0">
						<Stack gap="xs">
							<Group>
								<IconFileText size={16} color="#10b981" />
								<Text fw={500} lineClamp={1} style={{ fontFamily: "monospace" }}>
									{downloadReady.filepath}
								</Text>
								<Badge color="violet" variant="light">
									{getCompressionRatio(downloadReady.size, downloadReady.compressedSize)}% compression
								</Badge>
							</Group>
							<Group gap="lg" c="dimmed" fz="sm">
								<Text>
									Original:{" "}
									<Text span fw={500}>
										{formatFileSize(downloadReady.size)}
									</Text>
								</Text>
								<Text>
									Compressed:{" "}
									<Text span fw={500}>
										{formatFileSize(downloadReady.compressedSize)}
									</Text>
								</Text>
							</Group>
							<Group gap="sm" c="dimmed" fz="sm">
								<IconCalendar size={12} />
								<Text>Created: {new Date(downloadReady.timestamp).toLocaleDateString()}</Text>
							</Group>
						</Stack>
					</Card>

					<Group>
						<Button onClick={handleDownload} leftSection={<IconDownload size={16} />} color="green">
							Download File
						</Button>

						<Button variant="outline" onClick={handleClear}>
							Process Another URL
						</Button>
					</Group>
				</Stack>
			)}
		</Card>
	);
}
