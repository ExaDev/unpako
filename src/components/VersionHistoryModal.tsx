import {
	Modal,
	Stack,
	Text,
	Group,
	Button,
	ActionIcon,
	Tooltip,
	Badge,
	ScrollArea,
	Box,
} from "@mantine/core";
import {
	IconHistory,
	IconRestore,
	IconEye,
	IconX,
	IconCalendar,
	IconFile,
} from "@tabler/icons-react";
import { useState, useEffect, useCallback } from "react";
import type { FileVersion } from "../utils/db";
import { FileVersionStorage } from "../utils/fileVersionStorage";
import { getFilepathInfo } from "../utils/fileCompression";
import { detectLanguage, getFileIcon } from "../utils/languageDetection";

// Helper function to format bytes
function formatBytes(bytes: number): string {
	if (bytes === 0) return "0 B";
	const k = 1024;
	const sizes = ["B", "KB", "MB", "GB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

interface VersionHistoryModalProps {
	filepath: string;
	opened: boolean;
	onClose: () => void;
	onSelectVersion: (version: FileVersion) => void;
}

export function VersionHistoryModal({
	filepath,
	opened,
	onClose,
	onSelectVersion,
}: VersionHistoryModalProps) {
	const [versions, setVersions] = useState<FileVersion[]>([]);
	const [loading, setLoading] = useState(false);

	const loadVersions = useCallback(async () => {
		setLoading(true);
		try {
			const fileVersions = await FileVersionStorage.getFileVersions(filepath);
			setVersions(fileVersions);
		} catch (error) {
			console.error("Error loading file versions:", error);
		} finally {
			setLoading(false);
		}
	}, [filepath]);

	// Load versions when modal opens
	useEffect(() => {
		if (opened && filepath) {
			loadVersions();
		}
	}, [opened, filepath, loadVersions]);

	const handleSelectVersion = (version: FileVersion) => {
		onSelectVersion(version);
		onClose();
	};

	const handleRevert = async (version: FileVersion) => {
		try {
			await FileVersionStorage.revertToVersion(filepath, version.version);
			// Reload versions after revert
			await loadVersions();
		} catch (error) {
			console.error("Error reverting to version:", error);
		}
	};

	const { filename } = getFilepathInfo(filepath);

	return (
		<Modal
			opened={opened}
			onClose={onClose}
			title={
				<Group gap="xs">
					<IconHistory size={20} />
					<Text fw={600}>Version History: {filename}</Text>
				</Group>
			}
			size="lg"
		>
			<Stack gap="md" h={500}>
				{loading ? (
					<Text ta="center" c="dimmed" py="xl">
						Loading version history...
					</Text>
				) : versions.length === 0 ? (
					<Text ta="center" c="dimmed" py="xl">
						No version history available
					</Text>
				) : (
					<ScrollArea flex={1}>
						<Stack gap="xs">
							{versions.map(version => (
								<Box
									key={version.versionId}
									p="md"
									style={{
										borderRadius: "var(--mantine-radius-md)",
										backgroundColor: version.isLatest
											? "var(--mantine-color-blue-0)"
											: "var(--mantine-color-gray-0)",
										border: version.isLatest
											? "1px solid var(--mantine-color-blue-3)"
											: "1px solid var(--mantine-color-gray-3)",
									}}
								>
									<Group justify="space-between" align="start">
										<Stack gap="xs" flex={1}>
											<Group gap="xs">
												<Badge size="sm" color={version.isLatest ? "blue" : "gray"} variant="light">
													v{version.version}
													{version.isLatest && " (latest)"}
												</Badge>
												<Text component="span" c={getFileIcon(detectLanguage(filename))}>
													<IconFile size={16} />
												</Text>
												<Text size="sm" fw={500}>
													{formatBytes(version.size)}
												</Text>
												<Text size="sm" c="dimmed">
													compressed to {formatBytes(version.compressedSize)}
												</Text>
											</Group>

											<Group gap="xs" c="dimmed" mt="xs">
												<IconCalendar size={12} />
												<Text size="xs">{new Date(version.createdAt).toLocaleString()}</Text>
											</Group>
										</Stack>

										<Group gap="xs">
											<Tooltip label="View this version">
												<ActionIcon variant="subtle" size="sm" onClick={() => handleSelectVersion(version)}>
													<IconEye size={14} />
												</ActionIcon>
											</Tooltip>

											{!version.isLatest && (
												<Tooltip label="Revert to this version">
													<ActionIcon
														variant="subtle"
														size="sm"
														onClick={() => handleRevert(version)}
														color="orange"
													>
														<IconRestore size={14} />
													</ActionIcon>
												</Tooltip>
											)}
										</Group>
									</Group>
								</Box>
							))}
						</Stack>
					</ScrollArea>
				)}

				<Group justify="flex-end" mt="md">
					<Button variant="light" onClick={onClose} leftSection={<IconX size={14} />}>
						Close
					</Button>
				</Group>
			</Stack>
		</Modal>
	);
}
