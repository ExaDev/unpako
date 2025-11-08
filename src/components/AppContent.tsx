import { useState, useEffect } from "react";
import { Container, Title, Text, Group, Card, Badge, Grid, Box, Notification } from "@mantine/core";
import { IconPackage, IconCheck, IconLink } from "@tabler/icons-react";
import { FileDownload } from "./FileDownload";
import { FileTreeSidebar } from "./FileTreeSidebar";
import { FileEditor } from "./FileEditor";
import { ThemeToggle } from "./ThemeToggle";
import type { FileHistoryItem } from "../utils/db";
import { DexieHistoryStorage } from "../utils/dexieHistoryStorage";
import { generateShareableUrl } from "../utils/fileCompression";
import pako from "pako";

function AppContent() {
	const [files, setFiles] = useState<FileHistoryItem[]>([]);
	const [selectedFile, setSelectedFile] = useState<FileHistoryItem | null>(null);
	const [codeInput, setCodeInput] = useState("");
	const [filepath, setFilepath] = useState("");
	const [isEditMode, setIsEditMode] = useState(true);
	const [showNotification, setShowNotification] = useState<{
		type: "success" | "error";
		message: string;
	} | null>(null);

	const stats = {
		totalItems: files.length,
		totalSize: files.reduce((sum, file) => sum + file.size, 0),
		compressedSize: files.reduce((sum, file) => sum + file.compressedSize, 0),
	};

	// Load files from storage on mount
	useEffect(() => {
		loadFiles();
	}, []);

	// Load content from URL on mount
	useEffect(() => {
		const urlParams = new URLSearchParams(window.location.search);
		const data = urlParams.get("data");
		const urlFilepath = urlParams.get("filepath");
		const name = urlParams.get("name"); // For backward compatibility

		if (data && (urlFilepath || name)) {
			try {
				const decodedData = decodeURIComponent(data);
				// Decompress the content
				const compressed = Uint8Array.from(atob(decodedData), c => c.charCodeAt(0));
				const decompressed = pako.inflate(compressed);
				const content = new TextDecoder().decode(decompressed);

				setCodeInput(content);
				setFilepath(urlFilepath || name || "content.txt");
			} catch (error) {
				console.error("Failed to load content from URL:", error);
			}
		}
	}, []);

	const loadFiles = async () => {
		try {
			const historyFiles = await DexieHistoryStorage.getAllItems();
			setFiles(historyFiles);
		} catch (error) {
			console.error("Error loading files:", error);
		}
	};

	const handleFileSelect = (file: FileHistoryItem) => {
		setSelectedFile(file);
	};

	const handleFileUpload = () => {
		// This is handled in FileEditor component
	};

	const handleUpdateHistory = async (item: FileHistoryItem) => {
		try {
			await DexieHistoryStorage.addItem(item);
			await loadFiles(); // Refresh files list
		} catch (error) {
			console.error("Error updating history:", error);
		}
	};

	const handleShare = async () => {
		if (codeInput.trim() && filepath.trim()) {
			try {
				const url = generateShareableUrl(codeInput, filepath);
				await navigator.clipboard.writeText(url);
				setShowNotification({ type: "success", message: "URL copied to clipboard!" });
				// Update browser URL
				window.history.pushState({ path: url }, "", url);
			} catch (error) {
				setShowNotification({ type: "error", message: "Failed to copy URL" });
				console.error("Error copying URL:", error);
			}
		}
	};

	const handleDownload = () => {
		if (filepath && codeInput) {
			const blob = new Blob([codeInput], { type: "text/plain" });
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = filepath.split("/").pop() || "download.txt";
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
		}
	};

	const handleDelete = async () => {
		if (selectedFile) {
			try {
				await DexieHistoryStorage.deleteItem(selectedFile.id);
				await loadFiles();
				setSelectedFile(null);
				setCodeInput("");
				setFilepath("");
				setShowNotification({ type: "success", message: "File deleted successfully" });
			} catch (error) {
				setShowNotification({ type: "error", message: "Failed to delete file" });
				console.error("Error deleting file:", error);
			}
		}
	};

	return (
		<Container size="xl" py="xl" h="100vh" style={{ display: "flex", flexDirection: "column" }}>
			{/* Header */}
			<Card withBorder p="md" mb="lg">
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
						<ThemeToggle />
					</Group>
				</Group>
			</Card>

			{/* Notification */}
			{showNotification && (
				<Box mb="md">
					<Notification
						color={showNotification.type === "success" ? "green" : "red"}
						onClose={() => setShowNotification(null)}
						icon={showNotification.type === "success" ? <IconCheck size={16} /> : <IconLink size={16} />}
					>
						{showNotification.message}
					</Notification>
				</Box>
			)}

			{/* Main Content Grid */}
			<Grid h="100%" style={{ flex: 1, minHeight: 0 }}>
				{/* File Tree Sidebar */}
				<Grid.Col span={{ base: 12, md: 4, lg: 3 }}>
					<FileTreeSidebar
						files={files}
						selectedFile={selectedFile}
						onFileSelect={handleFileSelect}
						onUpload={handleFileUpload}
						stats={stats}
					/>
				</Grid.Col>

				{/* File Editor */}
				<Grid.Col span={{ base: 12, md: 8, lg: 9 }}>
					<FileEditor
						file={selectedFile}
						content={codeInput}
						filepath={filepath}
						isEditMode={isEditMode}
						onContentChange={setCodeInput}
						onFilepathChange={setFilepath}
						onEditModeToggle={() => setIsEditMode(!isEditMode)}
						onFileUpload={handleFileUpload}
						onDownload={handleDownload}
						onShare={handleShare}
						onDelete={handleDelete}
						onUpdateHistory={handleUpdateHistory}
					/>
				</Grid.Col>
			</Grid>

			{/* FileDownload Modal (hidden by default) */}
			<FileDownload onFileDownloaded={loadFiles} />
		</Container>
	);
}

export default AppContent;
