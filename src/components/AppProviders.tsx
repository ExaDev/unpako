import { ThemeProvider } from "../contexts/ThemeContext";
import { CodeHighlightAdapterProvider, createShikiAdapter } from "@mantine/code-highlight";
import type { ReactNode } from "react";

// Create shiki adapter
async function loadShiki() {
	const { createHighlighter } = await import("shiki");
	const shiki = await createHighlighter({
		langs: [
			"javascript",
			"typescript",
			"jsx",
			"tsx",
			"json",
			"css",
			"html",
			"vue",
			"svelte",
			"python",
			"java",
			"c",
			"cpp",
			"csharp",
			"php",
			"ruby",
			"go",
			"rust",
			"sql",
			"yaml",
			"xml",
			"markdown",
			"bash",
			"powershell",
			"dockerfile",
		],
		themes: ["dark-plus", "light-plus"],
	});
	return shiki;
}

const shikiAdapter = createShikiAdapter(loadShiki);

interface AppProvidersProps {
	children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
	return (
		<ThemeProvider>
			<CodeHighlightAdapterProvider adapter={shikiAdapter}>{children}</CodeHighlightAdapterProvider>
		</ThemeProvider>
	);
}
