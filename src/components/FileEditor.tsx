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
import type { FileHistoryItem } from "../utils/db";
import {
	decompressData,
	decodeFromBase64,
	compressData,
	encodeToBase64,
	generateShareableUrl,
} from "../utils/fileCompression";
import { getFilepathInfo } from "../utils/fileCompression";

interface FileEditorProps {
	file: FileHistoryItem | null;
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
	onUpdateHistory: (item: FileHistoryItem) => void;
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

	// Load file content when a file is selected
	useEffect(() => {
		if (file) {
			try {
				const decompressed = decompressData(decodeFromBase64(file.data));
				onContentChange(decompressed);
				onFilepathChange(file.filepath);
			} catch (error) {
				console.error("Error loading file content:", error);
				onContentChange("");
			}
		} else {
			onContentChange("");
			onFilepathChange("");
		}
	}, [file, onContentChange, onFilepathChange]);

	const updateHistoryWithCurrentContent = useCallback(async () => {
		if (!content.trim() || !filepath.trim()) return;

		try {
			const compressed = compressData(content);
			const encoded = encodeToBase64(compressed);
			const url = generateShareableUrl(content, filepath);

			const historyItem: FileHistoryItem = {
				id: file?.id || crypto.randomUUID(),
				data: encoded,
				filepath,
				size: new Blob([content]).size,
				compressedSize: compressed.length,
				createdAt: file?.createdAt || Date.now(),
				modifiedAt: Date.now(),
				url,
			};

			onUpdateHistory(historyItem);
		} catch (error) {
			console.error("Error updating history:", error);
		}
	}, [content, filepath, file, onUpdateHistory]);

	// Generate URL when content changes
	useEffect(() => {
		if (content.trim()) {
			const url = generateShareableUrl(content, filepath);
			setShareableUrl(url);
			// Only update browser URL automatically after initial load
			if (!isInitialLoad) {
				window.history.pushState({ path: url }, "", url);
			}
			// Update history in background
			updateHistoryWithCurrentContent();
		} else {
			setShareableUrl("");
			// Clear URL parameters when content is empty (only after initial load)
			if (!isInitialLoad) {
				window.history.pushState({}, "", window.location.pathname);
			}
		}
	}, [content, filepath, isInitialLoad, updateHistoryWithCurrentContent]);

	// Set isInitialLoad to false after first content update
	useEffect(() => {
		if (isInitialLoad && (content.trim() || filepath.trim())) {
			setIsInitialLoad(false);
		}
	}, [content, filepath, isInitialLoad]);

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
