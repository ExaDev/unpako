import { MantineProvider, createTheme } from '@mantine/core';
import type { ReactNode } from 'react';
import { useTheme } from '../hooks/useTheme';

interface ThemeProviderWrapperProps {
  children: ReactNode;
}

export function ThemeProviderWrapper({ children }: ThemeProviderWrapperProps) {
  const { effectiveTheme, theme } = useTheme();

  // Debug logging to see what values we're getting
  console.log('ThemeProviderWrapper render:', { theme, effectiveTheme });

  const mantineTheme = createTheme({
    primaryColor: 'blue',
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  });

  return (
    <MantineProvider theme={mantineTheme} colorScheme={effectiveTheme}>
      {children}
    </MantineProvider>
  );
}