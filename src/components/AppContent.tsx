import { useState, useEffect } from 'react';
import {
	Container,
	Title,
	Text,
	Stack,
	Group,
	Button,
	Card,
	Badge,
	Divider
} from '@mantine/core';
import {
	IconUpload,
	IconDownload,
	IconHistory,
	IconPackage
} from '@tabler/icons-react';
import { FileUpload } from './FileUpload';
import { FileDownload } from './FileDownload';
import { HistoryView } from './HistoryView';
import { ThemeToggle } from './ThemeToggle';
import type { CompressedFile, FileHistoryItem } from '../utils/fileCompression';
import { HistoryStorage } from '../utils/historyStorage';

function AppContent() {
	const [activeTab, setActiveTab] = useState('upload');
	const [stats, setStats] = useState(HistoryStorage.getStats());

	const updateStats = () => {
		setStats(HistoryStorage.getStats());
	};

	const handleFileCompressed = (compressedFile: CompressedFile, url: string) => {
		// TODO: Use compressedFile and url for history storage in future
		void compressedFile;
		void url;
		setActiveTab('upload'); // Stay on upload tab
		updateStats();
	};

	const handleFileDownloaded = (compressedFile: CompressedFile) => {
		// TODO: Use compressedFile for history storage in future
		void compressedFile;
		setActiveTab('download'); // Stay on download tab
		updateStats();
	};

	const handleHistoryItemSelected = (item: FileHistoryItem) => {
		// Switch to appropriate tab based on history item type
		setActiveTab(item.type === 'uploaded' ? 'upload' : 'download');
	};

	// Update stats on mount and when tab changes
	useEffect(() => {
		updateStats();
	}, [activeTab]);

	return (
		<Container size="xl" py="xl">
			{/* Header */}
			<Card withBorder p="md" mb="xl">
				<Group justify="space-between">
					<Group>
						<IconPackage size={32} color="#1c7ed6" />
						<div>
							<Title order={1} c="blue">
                  Unpako
							</Title>
							<Text size="sm" c="dimmed">
                  Share large files via compressed URLs
							</Text>
						</div>
					</Group>

					<Group>
						<Badge color="blue" variant="light" size="lg">
							{stats.totalItems} files
						</Badge>
						<Badge color="green" variant="light" size="lg">
							{stats.uploadedCount} uploaded
						</Badge>
						<Badge color="orange" variant="light" size="lg">
							{stats.downloadedCount} downloaded
						</Badge>
						<ThemeToggle />
					</Group>
				</Group>

				<Divider my="md" />

				<Group gap="md">
					<Button
						variant={activeTab === 'upload' ? 'filled' : 'subtle'}
						onClick={() => setActiveTab('upload')}
						leftSection={<IconUpload size={16} />}
					>
              Upload & Compress
					</Button>
					<Button
						variant={activeTab === 'download' ? 'filled' : 'subtle'}
						onClick={() => setActiveTab('download')}
						leftSection={<IconDownload size={16} />}
					>
              Download & Decompress
					</Button>
					<Button
						variant={activeTab === 'history' ? 'filled' : 'subtle'}
						onClick={() => setActiveTab('history')}
						leftSection={<IconHistory size={16} />}
					>
              History
					</Button>
				</Group>
			</Card>

			<Stack gap="xl">
				{activeTab === 'upload' && (
					<div>
						<Title order={2} mb="lg">
                Upload & Compress Files
						</Title>
						<Text size="lg" c="dimmed" mb="xl">
                Compress your files and share them via URL. No size limitations!
						</Text>
						<FileUpload onFileCompressed={handleFileCompressed} />
					</div>
				)}

				{activeTab === 'download' && (
					<div>
						<Title order={2} mb="lg">
                Download & Decompress Files
						</Title>
						<Text size="lg" c="dimmed" mb="xl">
                Paste a sharing URL to download the original file.
						</Text>
						<FileDownload onFileDownloaded={handleFileDownloaded} />
					</div>
				)}

				{activeTab === 'history' && (
					<div>
						<Title order={2} mb="lg">
                File History
						</Title>
						<Text size="lg" c="dimmed" mb="xl">
                View and manage your uploaded and downloaded files.
						</Text>
						<HistoryView onHistoryItemSelected={handleHistoryItemSelected} />
					</div>
				)}
			</Stack>
		</Container>
	);
}

export default AppContent;