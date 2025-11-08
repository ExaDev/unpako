import { ActionIcon, Box, Group, Text, rem, Tooltip, Badge } from "@mantine/core";
import { IconChevronRight, IconFile, IconFolder, IconHistory } from "@tabler/icons-react";
import type { FileVersion } from "../utils/db";
import { getFilepathInfo } from "../utils/fileCompression";
import { detectLanguage, getFileIcon } from "../utils/languageDetection";
import classes from "./FileTreeNode.module.css";

interface FileTreeNodeProps {
	item: FileVersion;
	level: number;
	isSelected: boolean;
	onSelect: (item: FileVersion) => void;
	onShowVersionHistory?: (filepath: string) => void;
}

export function FileTreeNode({
	item,
	level,
	isSelected,
	onSelect,
	onShowVersionHistory,
}: FileTreeNodeProps) {
	const { filename } = getFilepathInfo(item.filepath);
	const fileIcon = getFileIcon(detectLanguage(filename));

	const handleClick = () => {
		onSelect(item);
	};

	return (
		<Box
			className={`${classes.node} ${isSelected ? classes.selected : ""}`}
			style={{ paddingLeft: rem(level * 16) }}
			onClick={handleClick}
		>
			<Group gap="xs" align="center" justify="space-between">
				<Group gap="xs" align="center">
					<ActionIcon variant="transparent" size="sm" c="dimmed" style={{ visibility: "hidden" }}>
						<IconChevronRight size={12} />
					</ActionIcon>
					<Text component="span" c={fileIcon} size="sm">
						<IconFile size={16} />
					</Text>
					<Text size="sm" className={classes.filename} fw={isSelected ? 600 : 400}>
						{filename}
					</Text>
				</Group>
				<Group gap="xs" align="center">
					{item.version > 1 && (
						<Tooltip label={`Version ${item.version} of ${item.filepath}`}>
							<Badge size="xs" variant="light" color="blue">
								v{item.version}
							</Badge>
						</Tooltip>
					)}
					{onShowVersionHistory && (
						<Tooltip label="Show version history">
							<ActionIcon
								variant="subtle"
								size="xs"
								onClick={e => {
									e.stopPropagation();
									onShowVersionHistory(item.filepath);
								}}
							>
								<IconHistory size={12} />
							</ActionIcon>
						</Tooltip>
					)}
				</Group>
			</Group>
		</Box>
	);
}

interface FolderNodeProps {
	folderName: string;
	level: number;
	isExpanded: boolean;
	onToggle: () => void;
	children: React.ReactNode;
}

export function FolderNode({ folderName, level, isExpanded, onToggle, children }: FolderNodeProps) {
	return (
		<Box>
			<Box className={classes.node} style={{ paddingLeft: rem(level * 16) }} onClick={onToggle}>
				<Group gap="xs" align="center">
					<ActionIcon variant="transparent" size="sm" c="dimmed">
						<IconChevronRight
							size={12}
							style={{
								transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
								transition: "transform 200ms ease",
							}}
						/>
					</ActionIcon>
					<Text c="blue" size="sm">
						<IconFolder size={16} />
					</Text>
					<Text size="sm" className={classes.folderName} fw={600}>
						{folderName}
					</Text>
				</Group>
			</Box>
			{isExpanded && <Box className={children ? "" : classes.empty}>{children}</Box>}
		</Box>
	);
}
