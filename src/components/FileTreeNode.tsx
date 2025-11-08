import { ActionIcon, Box, Group, Text, rem } from "@mantine/core";
import { IconChevronRight, IconFile, IconFolder } from "@tabler/icons-react";
import type { FileHistoryItem } from "../utils/db";
import { getFilepathInfo } from "../utils/fileCompression";
import { detectLanguage, getFileIcon } from "../utils/languageDetection";
import classes from "./FileTreeNode.module.css";

interface FileTreeNodeProps {
	item: FileHistoryItem;
	level: number;
	isSelected: boolean;
	onSelect: (item: FileHistoryItem) => void;
}

export function FileTreeNode({ item, level, isSelected, onSelect }: FileTreeNodeProps) {
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
