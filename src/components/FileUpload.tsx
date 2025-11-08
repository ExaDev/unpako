import { useState, useRef } from "react";
import {
	Button,
	Text,
	Group,
	Progress,
	Stack,
	Alert,
	Card,
	Paper,
	TextInput,
	ActionIcon,
	Tooltip,
	Badge,
} from "@mantine/core";
import {
	IconUpload,
	IconFile,
	IconCopy,
	IconRefresh,
	IconCheck,
	IconAlertCircle,
	IconX,
} from "@tabler/icons-react";
import {
	compressFileWithPath,
	fileToUrl,
	formatFileSize,
	getCompressionRatio,
	validateFilepath,
} from "../utils/fileCompression";
import { DexieHistoryStorage } from "../utils/dexieHistoryStorage";
import type { CompressedFile } from "../utils/fileCompression";

interface FileUploadProps {
	onFileCompressed: (compressedFile: CompressedFile, url: string) => void;
}

export function FileUpload({ onFileCompressed }: FileUploadProps) {
	const [isDragging, setIsDragging] = useState(false);
	const [isCompressing, setIsCompressing] = useState(false);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [customFilepath, setCustomFilepath] = useState("");
	const [compressionResult, setCompressionResult] = useState<{
		compressedFile: CompressedFile;
		url: string;
	} | null>(null);
	const [compressionError, setCompressionError] = useState<string | null>(null);
	const [filepathError, setFilepathError] = useState<string | null>(null);
	const [compressionProgress, setCompressionProgress] = useState(0);
	const [copiedToClipboard, setCopiedToClipboard] = useState(false);

	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleDragEnter = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(true);
	};

	const handleDragLeave = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(false);
	};

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(false);

		const files = Array.from(e.dataTransfer.files);
		if (files.length > 0) {
			handleFileSelect(files[0]);
		}
	};

	const handleFileSelect = (file: File) => {
		setCompressionError(null);
		setCompressionResult(null);
		setSelectedFile(file);
		setCustomFilepath("");
		setCopiedToClipboard(false);
	};

	const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files;
		if (files && files.length > 0) {
			handleFileSelect(files[0]);
		}
	};

	const handleFilepathChange = (value: string) => {
		setCustomFilepath(value);

		// Validate filepath
		if (value && !validateFilepath(value)) {
			setFilepathError(
				'Invalid filepath. Avoid characters like <>:"|?* and leading/trailing slashes.'
			);
		} else {
			setFilepathError(null);
		}
	};

	const handleCompress = async () => {
		if (!selectedFile) return;

		// Validate filepath if provided
		if (customFilepath && !validateFilepath(customFilepath)) {
			setFilepathError(
				'Invalid filepath. Avoid characters like <>:"|?* and leading/trailing slashes.'
			);
			return;
		}

		setIsCompressing(true);
		setCompressionProgress(0);
		setCompressionError(null);
		setFilepathError(null);

		try {
			// Simulate progress for better UX
			const progressInterval = setInterval(() => {
				setCompressionProgress(prev => Math.min(prev + 10, 90));
			}, 100);

			// Use custom filepath if provided, otherwise use original filename
			const finalFilepath = customFilepath || selectedFile.name;
			const compressedFile = await compressFileWithPath(selectedFile, finalFilepath);
			const url = fileToUrl(compressedFile);

			clearInterval(progressInterval);
			setCompressionProgress(100);

			// Add to history
			await DexieHistoryStorage.addToHistory({
				...compressedFile,
				url,
				type: "uploaded",
			});

			setCompressionResult({ compressedFile, url });
			onFileCompressed(compressedFile, url);

			// Update browser URL
			window.history.pushState({}, "", url);
		} catch (error) {
			setCompressionError(error instanceof Error ? error.message : "Compression failed");
		} finally {
			setIsCompressing(false);
			setTimeout(() => setCompressionProgress(0), 1000);
		}
	};

	const handleReset = () => {
		setSelectedFile(null);
		setCustomFilepath("");
		setCompressionResult(null);
		setCompressionError(null);
		setFilepathError(null);
		setCompressionProgress(0);
		setCopiedToClipboard(false);
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	const copyToClipboard = async () => {
		if (compressionResult?.url) {
			try {
				await navigator.clipboard.writeText(compressionResult.url);
				setCopiedToClipboard(true);
				setTimeout(() => setCopiedToClipboard(false), 2000);
			} catch (error) {
				console.error("Failed to copy to clipboard:", error);
			}
		}
	};

	const compressionRatio = compressionResult
		? getCompressionRatio(
				compressionResult.compressedFile.size,
				compressionResult.compressedFile.compressedSize
			)
		: 0;

	return (
		<Card shadow="sm" withBorder p="lg">
			{/* File Selection Area */}
			{!selectedFile && (
				<Paper
					withBorder
					p="xl"
					style={{
						borderStyle: "dashed",
						borderColor: isDragging ? "#3b82f6" : undefined,
						backgroundColor: isDragging ? "#eff6ff" : undefined,
						cursor: "pointer",
						transition: "all 0.2s ease",
					}}
					onDragEnter={handleDragEnter}
					onDragOver={handleDragOver}
					onDragLeave={handleDragLeave}
					onDrop={handleDrop}
					onClick={() => fileInputRef.current?.click()}
				>
					<Stack align="center" gap="md">
						<IconUpload size={48} color={isDragging ? "#3b82f6" : "#6b7280"} />
						<Text size="lg" fw={500}>
							Drop your file here or click to browse
						</Text>
						<Text size="sm" c="dimmed">
							Any file type is supported • No size limitations
						</Text>
						<input
							ref={fileInputRef}
							type="file"
							onChange={handleFileInputChange}
							style={{ display: "none" }}
						/>
					</Stack>
				</Paper>
			)}

			{/* Selected File Info */}
			{selectedFile && !compressionResult && (
				<Stack gap="md">
					<Card withBorder p="md" bg="gray.0">
						<Group>
							<IconFile size={24} color="#3b82f6" />
							<div style={{ flex: 1 }}>
								<Text fw={500} lineClamp={1}>
									{selectedFile.name}
								</Text>
								<Text size="sm" c="dimmed">
									{formatFileSize(selectedFile.size)}
								</Text>
							</div>
						</Group>
					</Card>

					<TextInput
						label="Custom filepath (optional)"
						description="Enter a full path like 'foo/bar/baz.txt' or leave empty to use original filename"
						placeholder="foo/bar/baz.txt"
						value={customFilepath}
						onChange={e => handleFilepathChange(e.target.value)}
						error={filepathError}
						styles={{
							input: {
								fontFamily: "monospace",
							},
						}}
					/>

					{compressionError && (
						<Alert color="red" icon={<IconAlertCircle size={16} />} title="Compression Error">
							{compressionError}
						</Alert>
					)}

					{isCompressing && (
						<Stack gap="sm">
							<Group>
								<Text size="sm">Compressing file...</Text>
								<Badge color="blue" variant="light">
									{compressionProgress}%
								</Badge>
							</Group>
							<Progress value={compressionProgress} color="blue" />
						</Stack>
					)}

					<Group>
						<Button
							onClick={handleCompress}
							loading={isCompressing}
							disabled={isCompressing}
							leftSection={<IconUpload size={16} />}
						>
							{isCompressing ? "Compressing..." : "Compress & Get URL"}
						</Button>
						<Button
							variant="outline"
							onClick={handleReset}
							disabled={isCompressing}
							leftSection={<IconX size={16} />}
						>
							Cancel
						</Button>
					</Group>
				</Stack>
			)}

			{/* Compression Result */}
			{compressionResult && (
				<Stack gap="md">
					<Alert
						color="green"
						icon={<IconCheck size={16} />}
						title="Success! File compressed and ready to share"
					/>

					<Card withBorder p="md" bg="blue.0">
						<Stack gap="xs">
							<Group justify="space-between">
								<Text fw={500} lineClamp={1}>
									{compressionResult.compressedFile.filepath}
								</Text>
								<Badge color="green" variant="light">
									{compressionRatio}% smaller
								</Badge>
							</Group>
							<Group gap="lg" c="dimmed">
								<Text>
									Original:{" "}
									<Text span fw={500}>
										{formatFileSize(compressionResult.compressedFile.size)}
									</Text>
								</Text>
								<Text>
									Compressed:{" "}
									<Text span fw={500}>
										{formatFileSize(compressionResult.compressedFile.compressedSize)}
									</Text>
								</Text>
							</Group>
						</Stack>
					</Card>

					<Stack gap="sm">
						<Group>
							<Text fw={500}>Share URL:</Text>
							<Tooltip label={copiedToClipboard ? "Copied!" : "Copy to clipboard"}>
								<ActionIcon
									variant="subtle"
									color={copiedToClipboard ? "green" : "blue"}
									onClick={copyToClipboard}
								>
									{copiedToClipboard ? <IconCheck size={16} /> : <IconCopy size={16} />}
								</ActionIcon>
							</Tooltip>
						</Group>
						<TextInput
							value={compressionResult.url}
							readOnly
							styles={{
								input: {
									fontFamily: "monospace",
									fontSize: "0.875rem",
								},
							}}
						/>
					</Stack>

					<Group>
						<Button variant="outline" onClick={handleReset} leftSection={<IconRefresh size={16} />}>
							Compress Another File
						</Button>
					</Group>
				</Stack>
			)}
		</Card>
	);
}
