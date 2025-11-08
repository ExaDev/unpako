import { ActionIcon, Tooltip } from '@mantine/core';
import {
	IconSun,
	IconMoon,
	IconDeviceDesktop
} from '@tabler/icons-react';
import { useTheme } from '../hooks/useTheme';

export function ThemeToggle() {
	const { theme, effectiveTheme, toggleTheme } = useTheme();

	const getThemeIcon = () => {
		if (theme === 'system') {
			return effectiveTheme === 'dark' ? <IconDeviceDesktop size={18} /> : <IconDeviceDesktop size={18} />;
		} else if (theme === 'light') {
			return <IconSun size={18} />;
		} else {
			return <IconMoon size={18} />;
		}
	};

	const getThemeLabel = () => {
		if (theme === 'system') {
			return `System theme (${effectiveTheme})`;
		} else if (theme === 'light') {
			return 'Light mode';
		} else {
			return 'Dark mode';
		}
	};

	const getNextThemeLabel = () => {
		const systemTheme = effectiveTheme;
		const oppositeTheme = systemTheme === 'light' ? 'dark' : 'light';

		if (theme === 'system') {
			return `Next: ${oppositeTheme} mode`;
		} else if (theme === oppositeTheme) {
			return `Next: ${systemTheme} mode (explicit)`;
		} else {
			return 'Next: System theme';
		}
	};

	return (
		<Tooltip
			label={
				<div>
					<div>{getThemeLabel()}</div>
					<div style={{ fontSize: '0.75rem', opacity: 0.8 }}>
						{getNextThemeLabel()}
					</div>
				</div>
			}
			position="bottom"
			withArrow
		>
			<ActionIcon
				variant="subtle"
				size="lg"
				onClick={toggleTheme}
				aria-label={`Theme: ${getThemeLabel()}`}
			>
				{getThemeIcon()}
			</ActionIcon>
		</Tooltip>
	);
}