import {
	Box,
	Button,
	Card,
	Divider,
	Group,
	ScrollArea,
	Stack,
	Text,
	TextInput,
	Title,
} from "@mantine/core";
import { IconPlus, IconSearch } from "@tabler/icons-react";
import { useState, useMemo } from "react";
import type { FileHistoryItem } from "../utils/db";
import { FileTreeNode, FolderNode } from "./FileTreeNode";
import { getFilepathInfo } from "../utils/fileCompression";
import classes from "./FileTreeSidebar.module.css";

interface TreeNode {
	name: string;
	path: string;
	isFolder: boolean;
	children: Record<string, TreeNode>;
	fileItem?: FileHistoryItem;
	level: number;
}

interface FileTreeSidebarProps {
	files: FileHistoryItem[];
	selectedFile: FileHistoryItem | null;
	onFileSelect: (file: FileHistoryItem) => void;
	onUpload: () => void;
	stats: {
		totalItems: number;
		totalSize: number;
		compressedSize: number;
	};
}

export function FileTreeSidebar({
	files,
	selectedFile,
	onFileSelect,
	onUpload,
	stats,
}: FileTreeSidebarProps) {
	const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
	const [searchQuery, setSearchQuery] = useState("");

	// Build tree structure from flat file list
	const treeData = useMemo(() => {
		const tree: Record<string, TreeNode> = {};

		// Group files by directory structure
		files.forEach(file => {
			const { directory, filename } = getFilepathInfo(file.filepath);
			const parts = directory ? directory.split("/") : [];

			let currentLevel = tree;
			let currentPath = "";

			// Build folder structure
			parts.forEach((part, index) => {
				currentPath = currentPath ? `${currentPath}/${part}` : part;

				if (!currentLevel[part]) {
					currentLevel[part] = {
						name: part,
						path: currentPath,
						isFolder: true,
						children: {},
						level: index,
					};
				}
				currentLevel = currentLevel[part].children;
			});

			// Add file to the deepest folder
			currentLevel[filename] = {
				name: filename,
				path: file.filepath,
				isFolder: false,
				children: {},
				fileItem: file,
				level: parts.length,
			};
		});

		return tree;
	}, [files]);

	// Filter tree based on search query
	const filteredTree = useMemo(() => {
		if (!searchQuery.trim()) return treeData;

		const filterTree = (node: TreeNode, query: string): boolean => {
			// Check if current node matches
			const matches = node.name.toLowerCase().includes(query.toLowerCase());

			if (node.isFolder) {
				// Filter children and check if any match
				const filteredChildren: Record<string, TreeNode> = {};
				Object.entries(node.children).forEach(([key, child]) => {
					if (filterTree({ ...child }, query)) {
						filteredChildren[key] = child;
					}
				});
				node.children = filteredChildren;
				return matches || Object.keys(filteredChildren).length > 0;
			} else {
				// For files, just check if name matches
				return matches;
			}
		};

		const result: Record<string, TreeNode> = {};
		Object.entries(treeData).forEach(([key, node]) => {
			if (filterTree({ ...node }, searchQuery)) {
				result[key] = node;
			}
		});
		return result;
	}, [treeData, searchQuery]);

	const toggleFolder = (folderPath: string) => {
		setExpandedFolders(prev => {
			const newSet = new Set(prev);
			if (newSet.has(folderPath)) {
				newSet.delete(folderPath);
			} else {
				newSet.add(folderPath);
			}
			return newSet;
		});
	};

	const renderTreeNode = (node: TreeNode): React.ReactNode => {
		if (node.isFolder) {
			const isExpanded = expandedFolders.has(node.path);
			const hasChildren = Object.keys(node.children).length > 0;

			return (
				<FolderNode
					key={node.path}
					folderName={node.name}
					level={node.level}
					isExpanded={isExpanded}
					onToggle={() => toggleFolder(node.path)}
				>
					{hasChildren && Object.values(node.children).map(renderTreeNode)}
				</FolderNode>
			);
		} else if (node.fileItem) {
			return (
				<FileTreeNode
					key={node.fileItem.id}
					item={node.fileItem}
					level={node.level}
					isSelected={selectedFile?.id === node.fileItem.id}
					onSelect={onFileSelect}
				/>
			);
		}
		return null;
	};

	return (
		<Card h="100%" withBorder p={0}>
			<Stack gap={0} h="100%">
				{/* Header */}
				<Box p="md">
					<Group justify="space-between" mb="sm">
						<Title order={4}>Files</Title>
						<Button size="compact-sm" leftSection={<IconPlus size={14} />} onClick={onUpload}>
							Upload
						</Button>
					</Group>

					{/* Search */}
					<TextInput
						placeholder="Search files..."
						leftSection={<IconSearch size={16} />}
						value={searchQuery}
						onChange={event => setSearchQuery(event.currentTarget.value)}
						size="sm"
					/>

					{/* Stats */}
					<Box mt="sm">
						<Text size="xs" c="dimmed">
							{stats.totalItems} items • {formatBytes(stats.compressedSize)} compressed
						</Text>
					</Box>
				</Box>

				<Divider />

				{/* File Tree */}
				<ScrollArea flex={1}>
					<Box p="xs">
						{Object.keys(filteredTree).length === 0 ? (
							<Text c="dimmed" ta="center" py="xl">
								{searchQuery ? "No files found" : "No files yet"}
							</Text>
						) : (
							<Stack gap={0} className={classes.tree}>
								{Object.values(filteredTree).map(renderTreeNode)}
							</Stack>
						)}
					</Box>
				</ScrollArea>
			</Stack>
		</Card>
	);
}

function formatBytes(bytes: number): string {
	if (bytes === 0) return "0 B";
	const k = 1024;
	const sizes = ["B", "KB", "MB", "GB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
