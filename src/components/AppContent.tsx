import { useState, useEffect } from "react";
import {
	Container,
	Title,
	Text,
	Stack,
	Group,
	Button,
	Card,
	Badge,
	Divider,
	Textarea,
	Alert,
	TextInput,
	FileInput,
	Tooltip,
} from "@mantine/core";
import {
	IconFileText,
	IconDownload,
	IconHistory,
	IconPackage,
	IconAlertCircle,
	IconUpload,
	IconCopy,
	IconCheck,
} from "@tabler/icons-react";
import { FileDownload } from "./FileDownload";
import { HistoryView } from "./HistoryView";
import { ThemeToggle } from "./ThemeToggle";
import type { CompressedFile, FileHistoryItem } from "../utils/fileCompression";
import { HistoryStorage } from "../utils/historyStorage";
import { compressText, fileToUrl } from "../utils/fileCompression";
import pako from "pako";

function AppContent() {
	const [activeTab, setActiveTab] = useState("upload");
	const [stats, setStats] = useState(HistoryStorage.getStats());
	const [codeInput, setCodeInput] = useState("");
	const [filepath, setFilepath] = useState("");
	const [shareableUrl, setShareableUrl] = useState("");
	const [copied, setCopied] = useState(false);
	const [isInitialLoad, setIsInitialLoad] = useState(true);

	const updateStats = () => {
		setStats(HistoryStorage.getStats());
	};

	const handleFileUpload = (file: File | null) => {
		if (file) {
			// Set filepath with extension
			setFilepath(file.name);

			// Read file content
			const reader = new FileReader();
			reader.onload = e => {
				const content = e.target?.result as string;
				setCodeInput(content);
			};
			reader.onerror = () => {
				console.error("Error reading file");
			};

			// Read as text
			reader.readAsText(file);
		}
	};

	// Generate shareable URL whenever content or filepath changes (but not during initial load)
	useEffect(() => {
		// Skip URL generation during initial load from URL
		if (isInitialLoad) return;

		if (codeInput.trim()) {
			try {
				const compressedFile = compressText(codeInput, filepath || "content.txt");
				const url = fileToUrl(compressedFile);
				setShareableUrl(url);
				// Update browser URL without page reload
				window.history.pushState({ path: url }, "", url);
			} catch (error) {
				console.error("Error generating URL:", error);
				setShareableUrl("");
			}
		} else {
			setShareableUrl("");
			// Clear URL parameters when content is empty
			const cleanUrl = window.location.origin + window.location.pathname;
			window.history.pushState({ path: cleanUrl }, "", cleanUrl);
		}
	}, [codeInput, filepath, isInitialLoad]);

	const copyToClipboard = async () => {
		if (shareableUrl) {
			try {
				// Copy current browser URL instead of stored URL
				await navigator.clipboard.writeText(window.location.href);
				setCopied(true);
				setTimeout(() => setCopied(false), 2000);
			} catch (error) {
				console.error("Failed to copy URL:", error);
			}
		}
	};

	const handleFileDownloaded = (compressedFile: CompressedFile) => {
		// TODO: Use compressedFile for history storage in future
		void compressedFile;
		setActiveTab("download"); // Stay on download tab
		updateStats();
	};

	const handleHistoryItemSelected = (item: FileHistoryItem) => {
		// Switch to appropriate tab based on history item type
		setActiveTab(item.type === "uploaded" ? "upload" : "download");
	};

	// Load content from URL on mount
	useEffect(() => {
		const urlParams = new URLSearchParams(window.location.search);
		const data = urlParams.get("data");
		const filepath = urlParams.get("filepath");
		const name = urlParams.get("name"); // For backward compatibility

		if (data && (filepath || name)) {
			try {
				const decodedData = decodeURIComponent(data);
				// Decompress the content
				const compressed = Uint8Array.from(atob(decodedData), c => c.charCodeAt(0));
				const decompressed = pako.inflate(compressed);
				const content = new TextDecoder().decode(decompressed);

				setCodeInput(content);
				setFilepath(filepath || name || "content.txt");
				// Set initial load flag to prevent immediate URL regeneration
				setTimeout(() => setIsInitialLoad(false), 100);
			} catch (error) {
				console.error("Failed to load content from URL:", error);
				setIsInitialLoad(false);
			}
		} else {
			setIsInitialLoad(false);
		}
	}, []); // Only run once on mount

	// Update stats on mount and when tab changes
	useEffect(() => {
		updateStats();
	}, [activeTab]);

	return (
		<Container size="xl" py="xl">
			{/* Header */}
			<Card withBorder p="md" mb="xl">
				<Group justify="space-between">
					<Group>
						<IconPackage size={32} color="#1c7ed6" />
						<div>
							<Title order={1} c="blue">
								Unpako
							</Title>
							<Text size="sm" c="dimmed">
								Share code and text via compressed URLs
							</Text>
						</div>
					</Group>

					<Group>
						<Badge color="blue" variant="light" size="lg">
							{stats.totalItems} files
						</Badge>
						<Badge color="green" variant="light" size="lg">
							{stats.uploadedCount} uploaded
						</Badge>
						<Badge color="orange" variant="light" size="lg">
							{stats.downloadedCount} downloaded
						</Badge>
						<ThemeToggle />
					</Group>
				</Group>

				<Divider my="md" />

				<Group gap="md">
					<Button
						variant={activeTab === "upload" ? "filled" : "subtle"}
						onClick={() => setActiveTab("upload")}
						leftSection={<IconFileText size={16} />}
					>
						Text Compressor
					</Button>
					<Button
						variant={activeTab === "download" ? "filled" : "subtle"}
						onClick={() => setActiveTab("download")}
						leftSection={<IconDownload size={16} />}
					>
						Download & Decompress
					</Button>
					<Button
						variant={activeTab === "history" ? "filled" : "subtle"}
						onClick={() => setActiveTab("history")}
						leftSection={<IconHistory size={16} />}
					>
						History
					</Button>
				</Group>
			</Card>

			<Stack gap="xl">
				{activeTab === "upload" && (
					<div>
						<Title order={2} mb="lg">
							Text Compressor
						</Title>
						<Text size="lg" c="dimmed" mb="xl">
							Compress your text and share it via URL. Perfect for sharing configurations, logs, documents,
							or any text content!
						</Text>

						<Stack gap="md">
							<FileInput
								value={null}
								label="Or Upload File"
								description="Upload a text file to auto-populate filename and content"
								placeholder="Click to select file or drag and drop"
								accept=".txt,.json,.js,.ts,.jsx,.tsx,.py,.java,.cpp,.c,.h,.css,.scss,.html,.xml,.yaml,.yml,.md,.log,.conf,.config,.env"
								onChange={handleFileUpload}
								leftSection={<IconUpload size={16} />}
								clearable
							/>

							<TextInput
								placeholder="Enter filepath with extension (e.g., config.json, scripts/main.py, docs/document.txt)"
								label="Filepath"
								description="Optional: Specify a full filepath with extension for better organization (e.g., 'foo/bar/baz.txt')"
								value={filepath}
								onChange={event => setFilepath(event.currentTarget.value)}
								styles={{
									input: {
										fontFamily: "monospace",
									},
								}}
								leftSection={<IconFileText size={16} />}
							/>

							<Textarea
								placeholder="Paste your text, configuration, or any content here..."
								label="Text Input"
								description="Supports any text content with proper formatting preserved"
								minRows={10}
								maxRows={25}
								value={codeInput}
								onChange={event => setCodeInput(event.currentTarget.value)}
								styles={{
									input: {
										fontFamily: "monospace",
									},
								}}
								resize="vertical"
								autosize
							/>

							{codeInput.length > 0 && (
								<Alert icon={<IconAlertCircle size={16} />} title="Text Ready" color="blue" variant="light">
									{codeInput.length} characters ready for compression.
									{codeInput.split("\n").length > 1 && ` ${codeInput.split("\n").length} lines detected.`}
									{filepath && ` Filepath: ${filepath}`}
								</Alert>
							)}

							{shareableUrl && (
								<Alert
									icon={<IconDownload size={16} />}
									title="Ready to Share"
									color="green"
									variant="light"
								>
									<Text size="sm" mb="sm">
										Your content has been compressed. The browser URL has been updated with your shareable
										link.
									</Text>
									<Group justify="flex-end">
										<Tooltip label={copied ? "Copied!" : "Copy URL"} withinPortal>
											<Button
												variant="light"
												color={copied ? "teal" : "blue"}
												leftSection={copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
												onClick={copyToClipboard}
											>
												{copied ? "Copied!" : "Copy URL"}
											</Button>
										</Tooltip>
									</Group>
								</Alert>
							)}

							<Group justify="flex-end">
								<Button
									variant="light"
									onClick={() => {
										setCodeInput("");
										setFilepath("");
									}}
									disabled={!codeInput && !filepath}
								>
									Clear
								</Button>
							</Group>
						</Stack>
					</div>
				)}

				{activeTab === "download" && (
					<div>
						<Title order={2} mb="lg">
							Download & Decompress Text
						</Title>
						<Text size="lg" c="dimmed" mb="xl">
							Paste a sharing URL to download the original text content.
						</Text>
						<FileDownload onFileDownloaded={handleFileDownloaded} />
					</div>
				)}

				{activeTab === "history" && (
					<div>
						<Title order={2} mb="lg">
							Compression History
						</Title>
						<Text size="lg" c="dimmed" mb="xl">
							View and manage your compressed text history.
						</Text>
						<HistoryView onHistoryItemSelected={handleHistoryItemSelected} />
					</div>
				)}
			</Stack>
		</Container>
	);
}

export default AppContent;
