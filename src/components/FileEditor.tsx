import {
	ActionIcon,
	Box,
	Button,
	Card,
	Divider,
	Group,
	Highlight,
	Stack,
	Switch,
	Text,
	Textarea,
	TextInput,
	Title,
} from "@mantine/core";
import {
	IconDownload,
	IconEdit,
	IconEye,
	IconFile,
	IconFileUpload,
	IconLink,
	IconTrash,
} from "@tabler/icons-react";
import { useState, useEffect, useCallback } from "react";
import type { FileVersion } from "../utils/db";
import {
	decompressData,
	decodeFromBase64,
	compressData,
	encodeToBase64,
	generateShareableUrl,
} from "../utils/fileCompression";
import { getFilepathInfo } from "../utils/fileCompression";

interface FileEditorProps {
	file: FileVersion | null;
	content: string;
	filepath: string;
	isEditMode: boolean;
	onContentChange: (content: string) => void;
	onFilepathChange: (filepath: string) => void;
	onEditModeToggle: () => void;
	onFileUpload: (file: File) => void;
	onDownload: () => void;
	onShare: () => void;
	onDelete: () => void;
	onUpdateHistory: (item: FileVersion) => void;
}

export function FileEditor({
	file,
	content,
	filepath,
	isEditMode,
	onContentChange,
	onFilepathChange,
	onEditModeToggle,
	onFileUpload,
	onDownload,
	onShare,
	onDelete,
	onUpdateHistory,
}: FileEditorProps) {
	const [shareableUrl, setShareableUrl] = useState("");
	const [isUploading, setIsUploading] = useState(false);
	const [isInitialLoad, setIsInitialLoad] = useState(true);
	const [lastSavedContent, setLastSavedContent] = useState("");
	const [isLoadingFile, setIsLoadingFile] = useState(false);

	// Load file content when a file is selected
	useEffect(() => {
		if (file) {
			setIsLoadingFile(true);
			try {
				const decompressed = decompressData(decodeFromBase64(file.data));
				onContentChange(decompressed);
				onFilepathChange(file.filepath);
				// Update last saved state to prevent version creation on file load
				setLastSavedContent(decompressed);
				// Small delay to ensure loading state is properly set
				setTimeout(() => setIsLoadingFile(false), 100);
			} catch (error) {
				console.error("Error loading file content:", error);
				onContentChange("");
				setLastSavedContent("");
				setIsLoadingFile(false);
			}
		} else {
			onContentChange("");
			onFilepathChange("");
			setLastSavedContent("");
			setIsLoadingFile(false);
		}
	}, [file, onContentChange, onFilepathChange]);

	const updateHistoryWithCurrentContent = useCallback(async () => {
		// Don't create versions during file loading or initial load
		if (isLoadingFile || isInitialLoad) return;

		if (!content.trim() || !filepath.trim()) return;

		// Check if content actually changed from last saved version
		const contentChanged = content !== lastSavedContent;

		// Only create a new version if content actually changed
		// Filepath changes without content changes don't need new versions
		if (!contentChanged) {
			console.log("Content unchanged, skipping version creation");
			return;
		}

		try {
			const compressed = compressData(content);
			const encoded = encodeToBase64(compressed);
			const url = generateShareableUrl(content, filepath);

			const historyItem: FileVersion = {
				versionId: file?.versionId || crypto.randomUUID(),
				data: encoded,
				filepath,
				size: new Blob([content]).size,
				compressedSize: compressed.length,
				createdAt: file?.createdAt || Date.now(),
				version: file ? file.version + 1 : 1,
				isLatest: true,
				url,
			};

			onUpdateHistory(historyItem);

			// Update last saved state after successful version creation
			setLastSavedContent(content);

			console.log("New version created due to content change");
		} catch (error) {
			console.error("Error updating history:", error);
		}
	}, [content, filepath, file, onUpdateHistory, lastSavedContent, isLoadingFile, isInitialLoad]);

	// Generate URL when content changes
	useEffect(() => {
		if (content.trim()) {
			const url = generateShareableUrl(content, filepath);
			setShareableUrl(url);
			// Only update browser URL automatically after initial load
			if (!isInitialLoad) {
				window.history.pushState({ path: url }, "", url);
			}
			// Update history in background (only if not loading file)
			if (!isLoadingFile) {
				updateHistoryWithCurrentContent();
			}
		} else {
			setShareableUrl("");
			// Clear URL parameters when content is empty (only after initial load)
			if (!isInitialLoad) {
				window.history.pushState({}, "", window.location.pathname);
			}
		}
	}, [content, filepath, isInitialLoad, updateHistoryWithCurrentContent, isLoadingFile]);

	// Set isInitialLoad to false after first content update
	useEffect(() => {
		if (isInitialLoad && (content.trim() || filepath.trim())) {
			setIsInitialLoad(false);
			// For new files (no existing file), set initial content as last saved
			if (!file) {
				setLastSavedContent(content);
			}
		}
	}, [content, filepath, isInitialLoad, file]);

	const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
		const uploadedFile = event.target.files?.[0];
		if (uploadedFile) {
			setIsUploading(true);
			const reader = new FileReader();
			reader.onload = e => {
				const fileContent = e.target?.result as string;
				onContentChange(fileContent);
				onFilepathChange(uploadedFile.name);
				onFileUpload(uploadedFile);
				setIsUploading(false);
			};
			reader.onerror = () => {
				console.error("Error reading file");
				setIsUploading(false);
			};
			reader.readAsText(uploadedFile);
		}
	};

	const { filename } = getFilepathInfo(filepath);

	return (
		<Card h="100%" withBorder p={0}>
			<Stack gap={0} h="100%">
				{/* Header */}
				<Box p="md">
					<Group justify="space-between">
						<Group>
							<IconFile size={20} />
							<Title order={4}>{file ? filename : "New File"}</Title>
						</Group>
						<Group>
							<Switch
								size="sm"
								checked={isEditMode}
								onChange={onEditModeToggle}
								onLabel={<IconEdit size={14} />}
								offLabel={<IconEye size={14} />}
								labelPosition="left"
								label={isEditMode ? "Edit" : "Preview"}
							/>
						</Group>
					</Group>
				</Box>

				<Divider />

				{/* Toolbar */}
				<Box p="md">
					<Group justify="space-between">
						<Group>
							<TextInput
								placeholder="File path with extension (e.g., example.txt)"
								value={filepath}
								onChange={e => onFilepathChange(e.currentTarget.value)}
								size="sm"
								style={{ flex: 1, minWidth: 200 }}
							/>
						</Group>
						<Group>
							<Button
								component="label"
								size="compact-sm"
								leftSection={<IconFileUpload size={14} />}
								loading={isUploading}
							>
								Upload
								<input
									type="file"
									hidden
									onChange={handleFileUpload}
									accept=".txt,.json,.js,.ts,.jsx,.tsx,.html,.css,.md,.py,.java,.c,.cpp,.go,.rs"
								/>
							</Button>
							{shareableUrl && (
								<>
									<Button size="compact-sm" leftSection={<IconLink size={14} />} onClick={onShare}>
										Copy Link
									</Button>
									<Button size="compact-sm" leftSection={<IconDownload size={14} />} onClick={onDownload}>
										Download
									</Button>
								</>
							)}
							{file && (
								<ActionIcon color="red" variant="light" size="sm" onClick={onDelete}>
									<IconTrash size={14} />
								</ActionIcon>
							)}
						</Group>
					</Group>
				</Box>

				<Divider />

				{/* Content Area */}
				<Box flex={1} p="md" style={{ minHeight: 0 }}>
					{!filepath.trim() && !content.trim() ? (
						// Empty state
						<Box h="100%" display="flex" style={{ alignItems: "center", justifyContent: "center" }}>
							<Stack align="center" gap="md">
								<IconFile size={48} style={{ color: "var(--mantine-color-dimmed)" }} />
								<Text size="lg" c="dimmed">
									Select a file from the sidebar or create a new one
								</Text>
								<Button component="label" leftSection={<IconFileUpload size={14} />}>
									Upload File
									<input
										type="file"
										hidden
										onChange={handleFileUpload}
										accept=".txt,.json,.js,.ts,.jsx,.tsx,.html,.css,.md,.py,.java,.c,.cpp,.go,.rs"
									/>
								</Button>
							</Stack>
						</Box>
					) : isEditMode ? (
						// Edit mode
						<Textarea
							value={content}
							onChange={e => onContentChange(e.currentTarget.value)}
							placeholder="Enter your text here..."
							style={{
								height: "100%",
								fontFamily: "monospace",
								resize: "none",
							}}
							autosize={false}
						/>
					) : (
						// Preview mode
						<Box h="100%" style={{ overflow: "auto" }}>
							{content.trim() ? (
								<Highlight highlight={[]}>{content}</Highlight>
							) : (
								<Text c="dimmed" style={{ fontStyle: "italic" }}>
									Empty file
								</Text>
							)}
						</Box>
					)}
				</Box>
			</Stack>
		</Card>
	);
}
