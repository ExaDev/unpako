import { useState, useEffect } from "react";
import {
	Text,
	Group,
	Stack,
	Card,
	Button,
	ActionIcon,
	Badge,
	Grid,
	Alert,
	Modal,
	TextInput,
	ScrollArea,
	Tooltip,
	Box,
	Select,
	SegmentedControl,
} from "@mantine/core";
import {
	IconHistory,
	IconDownload,
	IconTrash,
	IconCopy,
	IconFileExport,
	IconFileImport,
	IconCalendar,
	IconFileText,
	IconShare,
	IconSortAscending,
	IconSortDescending,
} from "@tabler/icons-react";
import { DexieHistoryStorage } from "../utils/dexieHistoryStorage";
import {
	fileToUrl,
	downloadFile,
	formatFileSize,
	getCompressionRatio,
} from "../utils/fileCompression";
import type { FileHistoryItem } from "../utils/fileCompression";

interface HistoryViewProps {
	onHistoryItemSelected: (item: FileHistoryItem) => void;
}

export function HistoryView({ onHistoryItemSelected }: HistoryViewProps) {
	const [history, setHistory] = useState<FileHistoryItem[]>([]);
	const [stats, setStats] = useState({
		totalItems: 0,
		totalSize: 0,
		totalCompressedSize: 0,
		uploadedCount: 0,
		downloadedCount: 0,
	});
	const [sortBy, setSortBy] = useState<"createdAt" | "modifiedAt" | "filepath" | "size">(
		"modifiedAt"
	);
	const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
	const [showClearModal, setShowClearModal] = useState(false);
	const [showImportModal, setShowImportModal] = useState(false);
	const [importData, setImportData] = useState("");
	const [importResult, setImportResult] = useState<{
		success: boolean;
		imported: number;
		errors: string[];
	} | null>(null);

	const refreshHistory = async () => {
		const newHistory = await DexieHistoryStorage.getHistory();
		setHistory(newHistory);

		const newStats = await DexieHistoryStorage.getStats();
		setStats(newStats);
	};

	useEffect(() => {
		refreshHistory();
	}, []);

	const sortHistory = (items: FileHistoryItem[]): FileHistoryItem[] => {
		const sorted = [...items].sort((a, b) => {
			let comparison = 0;

			switch (sortBy) {
				case "filepath":
					comparison = a.filepath.localeCompare(b.filepath);
					break;
				case "size":
					comparison = a.size - b.size;
					break;
				case "createdAt":
					comparison = a.createdAt - b.createdAt;
					break;
				case "modifiedAt":
				default:
					comparison = a.modifiedAt - b.modifiedAt;
					break;
			}

			return sortOrder === "asc" ? comparison : -comparison;
		});

		return sorted;
	};

	const sortedHistory = sortHistory(history);

	const handleDelete = async (id: string) => {
		await DexieHistoryStorage.removeFromHistory(id);
		refreshHistory();
	};

	const handleClearAll = async () => {
		await DexieHistoryStorage.clearHistory();
		refreshHistory();
		setShowClearModal(false);
	};

	const handleDownload = (item: FileHistoryItem) => {
		try {
			downloadFile(item);
			onHistoryItemSelected(item);
		} catch (error) {
			console.error("Download failed:", error);
		}
	};

	const handleCopyUrl = async (item: FileHistoryItem) => {
		const url = item.url || fileToUrl(item);
		try {
			await navigator.clipboard.writeText(url);
		} catch (error) {
			console.error("Failed to copy URL:", error);
		}
	};

	const handleOpenUrl = (item: FileHistoryItem) => {
		const url = item.url || fileToUrl(item);
		window.history.pushState({}, "", url);
		onHistoryItemSelected(item);
	};

	const handleExport = async () => {
		const data = await DexieHistoryStorage.exportHistory();
		const blob = new Blob([data], { type: "application/json" });
		const url = URL.createObjectURL(blob);

		const a = document.createElement("a");
		a.href = url;
		a.download = "unpako-history.json";
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);

		URL.revokeObjectURL(url);
	};

	const handleImport = async () => {
		const result = await DexieHistoryStorage.importHistory(importData);
		setImportResult(result);

		if (result.success) {
			refreshHistory();
			setShowImportModal(false);
			setImportData("");
		}
	};

	const compressionRatio = getCompressionRatio(stats.totalSize, stats.totalCompressedSize);

	return (
		<Box>
			{/* Statistics */}
			<Card mb="lg" shadow="sm" withBorder>
				<Text size="lg" fw={600} mb="md">
					<Group>
						<IconHistory size={20} />
						Statistics
					</Group>
				</Text>

				<Grid>
					<Grid.Col span={{ base: 6, md: 3 }}>
						<Card shadow="xs" withBorder p="md">
							<Text size="2xl" fw={700} c="blue">
								{stats.totalItems}
							</Text>
							<Text size="sm" c="dimmed">
								Total Files
							</Text>
						</Card>
					</Grid.Col>

					<Grid.Col span={{ base: 6, md: 3 }}>
						<Card shadow="xs" withBorder p="md">
							<Text size="2xl" fw={700} c="green">
								{formatFileSize(stats.totalSize)}
							</Text>
							<Text size="sm" c="dimmed">
								Original Size
							</Text>
						</Card>
					</Grid.Col>

					<Grid.Col span={{ base: 6, md: 3 }}>
						<Card shadow="xs" withBorder p="md">
							<Text size="2xl" fw={700} c="orange">
								{formatFileSize(stats.totalCompressedSize)}
							</Text>
							<Text size="sm" c="dimmed">
								Compressed Size
							</Text>
						</Card>
					</Grid.Col>

					<Grid.Col span={{ base: 6, md: 3 }}>
						<Card shadow="xs" withBorder p="md">
							<Text size="2xl" fw={700} c="violet">
								{compressionRatio}%
							</Text>
							<Text size="sm" c="dimmed">
								Compression
							</Text>
						</Card>
					</Grid.Col>
				</Grid>
			</Card>

			{/* Actions */}
			<Group mb="md">
				<Select
					label="Sort by"
					data={[
						{ value: "modifiedAt", label: "Modified Date" },
						{ value: "createdAt", label: "Created Date" },
						{ value: "filepath", label: "Filepath" },
						{ value: "size", label: "File Size" },
					]}
					value={sortBy}
					onChange={value => setSortBy(value as "createdAt" | "modifiedAt" | "filepath" | "size")}
					w={140}
					size="sm"
				/>

				<SegmentedControl
					size="sm"
					data={[
						{ label: <IconSortDescending size={16} />, value: "desc" },
						{ label: <IconSortAscending size={16} />, value: "asc" },
					]}
					value={sortOrder}
					onChange={value => setSortOrder(value as "asc" | "desc")}
				/>

				<Button
					variant="outline"
					leftSection={<IconFileExport size={16} />}
					onClick={handleExport}
					disabled={history.length === 0}
				>
					Export History
				</Button>

				<Button
					variant="outline"
					leftSection={<IconFileImport size={16} />}
					onClick={() => setShowImportModal(true)}
				>
					Import History
				</Button>

				<Button
					variant="outline"
					color="red"
					leftSection={<IconTrash size={16} />}
					onClick={() => setShowClearModal(true)}
					disabled={history.length === 0}
				>
					Clear All
				</Button>
			</Group>

			{/* History Items */}
			{sortedHistory.length === 0 ? (
				<Card shadow="sm" withBorder p="xl">
					<Text ta="center" c="dimmed" size="lg">
						No files in history yet
					</Text>
					<Text ta="center" c="dimmed" size="sm" mt="xs">
						Upload or download files to see them here
					</Text>
				</Card>
			) : (
				<ScrollArea h={400}>
					<Stack gap="sm">
						{sortedHistory.map(item => (
							<Card key={item.id} shadow="sm" withBorder p="md">
								<Group justify="space-between" align="flex-start">
									<div style={{ flex: 1 }}>
										<Group mb="xs">
											<IconFileText size={16} />
											<Text
												fw={500}
												size="md"
												lineClamp={1}
												style={{ fontFamily: "monospace", flex: 1, minWidth: 0 }}
											>
												{item.filepath}
											</Text>
										</Group>

										<Group gap="xs" mb="xs">
											<Badge color={item.type === "uploaded" ? "blue" : "green"} variant="light" size="xs">
												{item.type === "uploaded" ? "Uploaded" : "Downloaded"}
											</Badge>

											<Badge color="violet" variant="light" size="xs">
												{getCompressionRatio(item.size, item.compressedSize)}% smaller
											</Badge>
										</Group>

										<Group gap="md" c="dimmed" fz="sm">
											<Text span>
												{formatFileSize(item.size)} → {formatFileSize(item.compressedSize)}
											</Text>
											<Text span>
												<IconCalendar size={12} />
												Created: {new Date(item.createdAt).toLocaleDateString()}
											</Text>
											{item.modifiedAt !== item.createdAt && (
												<Text span>
													<IconCalendar size={12} />
													Modified: {new Date(item.modifiedAt).toLocaleDateString()}
												</Text>
											)}
										</Group>
									</div>

									<Group gap="xs">
										<Tooltip label="Open in browser">
											<ActionIcon variant="subtle" color="blue" onClick={() => handleOpenUrl(item)}>
												<IconShare size={16} />
											</ActionIcon>
										</Tooltip>

										<Tooltip label="Copy URL">
											<ActionIcon variant="subtle" color="gray" onClick={() => handleCopyUrl(item)}>
												<IconCopy size={16} />
											</ActionIcon>
										</Tooltip>

										<Tooltip label="Download file">
											<ActionIcon variant="subtle" color="green" onClick={() => handleDownload(item)}>
												<IconDownload size={16} />
											</ActionIcon>
										</Tooltip>

										<Tooltip label="Delete">
											<ActionIcon variant="subtle" color="red" onClick={() => handleDelete(item.id)}>
												<IconTrash size={16} />
											</ActionIcon>
										</Tooltip>
									</Group>
								</Group>
							</Card>
						))}
					</Stack>
				</ScrollArea>
			)}

			{/* Clear Confirmation Modal */}
			<Modal
				opened={showClearModal}
				onClose={() => setShowClearModal(false)}
				title="Clear All History"
				centered
			>
				<Text mb="lg">Are you sure you want to clear all history? This action cannot be undone.</Text>

				<Group justify="flex-end">
					<Button variant="outline" onClick={() => setShowClearModal(false)}>
						Cancel
					</Button>
					<Button color="red" onClick={handleClearAll}>
						Clear All
					</Button>
				</Group>
			</Modal>

			{/* Import Modal */}
			<Modal
				opened={showImportModal}
				onClose={() => {
					setShowImportModal(false);
					setImportData("");
					setImportResult(null);
				}}
				title="Import History"
				size="lg"
			>
				<Stack>
					<TextInput
						label="Paste your exported history data (JSON)"
						placeholder="Paste JSON data here..."
						value={importData}
						onChange={e => setImportData(e.target.value)}
						error={importResult?.errors?.join(", ")}
						styles={{
							input: {
								fontFamily: "monospace",
								minHeight: "120px",
							},
						}}
					/>

					{importResult && (
						<Alert
							color={importResult.success ? "green" : "red"}
							title={importResult.success ? "Success" : "Import Failed"}
						>
							{importResult.success
								? `Successfully imported ${importResult.imported} items.`
								: `Failed to import. ${importResult.errors.join(" ")}`}
						</Alert>
					)}

					<Group justify="flex-end">
						<Button variant="outline" onClick={() => setShowImportModal(false)}>
							Cancel
						</Button>
						<Button onClick={handleImport} disabled={!importData.trim()}>
							Import
						</Button>
					</Group>
				</Stack>
			</Modal>
		</Box>
	);
}
