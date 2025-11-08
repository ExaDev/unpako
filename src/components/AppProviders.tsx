import { ThemeProvider } from '../contexts/ThemeContext';
import type { ReactNode } from 'react';

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
	return (
		<ThemeProvider>
			{children}
		</ThemeProvider>
	);
}