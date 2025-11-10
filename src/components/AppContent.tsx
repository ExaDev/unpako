import { useState, useEffect } from "react";
import { Title, Text, Group, Card, Badge, Box, Notification, Anchor } from "@mantine/core";
import { IconPackage, IconCheck, IconLink, IconBrandGithub } from "@tabler/icons-react";
import packageJson from "../../package.json";
import { FileTreeSidebar } from "./FileTreeSidebar";
import { FileEditor } from "./FileEditor";
import { ThemeToggle } from "./ThemeToggle";
import { VersionHistoryModal } from "./VersionHistoryModal";
import type { FileVersion } from "../utils/db";
import { FileVersionStorage } from "../utils/fileVersionStorage";
import { generateShareableUrl, decompressData, decodeFromBase64 } from "../utils/fileCompression";
import pako from "pako";

function AppContent() {
	const [files, setFiles] = useState<FileVersion[]>([]);
	const [selectedFile, setSelectedFile] = useState<FileVersion | null>(null);
	const [codeInput, setCodeInput] = useState("");
	const [filepath, setFilepath] = useState("");
	const [isEditMode, setIsEditMode] = useState(true);
	const [showNotification, setShowNotification] = useState<{
		type: "success" | "error";
		message: string;
	} | null>(null);
	const [versionHistoryModal, setVersionHistoryModal] = useState<{
		filepath: string;
		opened: boolean;
	}>({
		filepath: "",
		opened: false,
	});

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
			const historyFiles = await FileVersionStorage.getLatestFiles();
			setFiles(historyFiles);
		} catch (error) {
			console.error("Error loading files:", error);
		}
	};

	const handleFileSelect = (file: FileVersion) => {
		setSelectedFile(file);
	};

	const handleFileUpload = () => {
		// This is handled in FileEditor component
	};

	const handleShowVersionHistory = (filepath: string) => {
		setVersionHistoryModal({
			filepath,
			opened: true,
		});
	};

	const handleSelectVersion = async (version: FileVersion) => {
		try {
			// Decompress the version data and load it into the editor
			const compressed = decodeFromBase64(version.data);
			const content = decompressData(compressed);

			setCodeInput(content);
			setFilepath(version.filepath);
			setSelectedFile(version);
			setIsEditMode(false); // Start in view mode
		} catch (error) {
			console.error("Error loading version:", error);
			setShowNotification({
				type: "error",
				message: "Failed to load version content",
			});
		}
	};

	const handleUpdateHistory = async (item: FileVersion) => {
		try {
			await FileVersionStorage.addItem(item);
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
				await FileVersionStorage.deleteItem(selectedFile.versionId);
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
		<Box h="100vh" w="100%" style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
			{/* Compact Header */}
			<Card
				withBorder={false}
				p="xs"
				style={{ borderBottom: "1px solid var(--mantine-color-default-border)", flexShrink: 0 }}
			>
				<Group justify="space-between">
					<Group gap="sm">
						<IconPackage size={24} color="#1c7ed6" />
						<div>
							<Title order={2} c="blue" size="h4">
								Unpako
							</Title>
							<Text size="xs" c="dimmed">
								Share code via compressed URLs
							</Text>
						</div>
					</Group>

					<Group gap="sm">
						<Badge color="blue" variant="light" size="sm">
							{stats.totalItems} files
						</Badge>
						<ThemeToggle />
					</Group>
				</Group>
			</Card>

			{/* Notification */}
			{showNotification && (
				<Box p="xs" style={{ flexShrink: 0 }}>
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
			<Box style={{ flex: 1, minHeight: 0, display: "flex" }}>
				{/* File Tree Sidebar */}
				<Box
					style={{
						width: "33.33%",
						minWidth: 250,
						maxWidth: 350,
						borderRight: "1px solid var(--mantine-color-default-border)",
					}}
				>
					<FileTreeSidebar
						files={files}
						selectedFile={selectedFile}
						onFileSelect={handleFileSelect}
						onUpload={handleFileUpload}
						onShowVersionHistory={handleShowVersionHistory}
						stats={stats}
					/>
				</Box>

				{/* File Editor */}
				<Box style={{ flex: 1, minHeight: 0, padding: "var(--mantine-spacing-sm)" }}>
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
				</Box>
			</Box>

			{/* Minimal Footer */}
			<Box
				p="xs"
				style={{ borderTop: "1px solid var(--mantine-color-default-border)", flexShrink: 0 }}
			>
				<Group justify="center" gap="xs">
					<Text size="xs" c="dimmed">
						v{packageJson.version}
					</Text>
					<Anchor
						size="xs"
						href={`https://github.com/ExaDev/unpako/releases/tag/v${packageJson.version}`}
						target="_blank"
						rel="noopener noreferrer"
					>
						<Group gap={4} align="center">
							<IconBrandGithub size={10} />
							Notes
						</Group>
					</Anchor>
				</Group>
			</Box>

			{/* Version History Modal */}
			<VersionHistoryModal
				filepath={versionHistoryModal.filepath}
				opened={versionHistoryModal.opened}
				onClose={() =>
					setVersionHistoryModal({
						filepath: "",
						opened: false,
					})
				}
				onSelectVersion={handleSelectVersion}
			/>
		</Box>
	);
}

export default AppContent;
