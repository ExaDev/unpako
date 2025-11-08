export type SupportedLanguage =
	| "javascript"
	| "typescript"
	| "jsx"
	| "tsx"
	| "json"
	| "css"
	| "scss"
	| "html"
	| "vue"
	| "svelte"
	| "python"
	| "java"
	| "c"
	| "cpp"
	| "csharp"
	| "php"
	| "ruby"
	| "go"
	| "rust"
	| "sql"
	| "yaml"
	| "xml"
	| "markdown"
	| "bash"
	| "powershell"
	| "dockerfile"
	| "plaintext"
	| "text";

const EXTENSION_MAP: Record<string, SupportedLanguage> = {
	// JavaScript/TypeScript
	".js": "javascript",
	".jsx": "jsx",
	".mjs": "javascript",
	".cjs": "javascript",
	".ts": "typescript",
	".tsx": "tsx",
	".mts": "typescript",
	".cts": "typescript",

	// Web
	".html": "html",
	".htm": "html",
	".css": "css",
	".scss": "scss",
	".sass": "scss",
	".less": "css",
	".vue": "vue",
	".svelte": "svelte",

	// Data formats
	".json": "json",
	".jsonc": "json",
	".xml": "xml",
	".yaml": "yaml",
	".yml": "yaml",
	".toml": "plaintext",
	".ini": "plaintext",

	// Programming languages
	".py": "python",
	".pyw": "python",
	".java": "java",
	".c": "c",
	".h": "c",
	".cpp": "cpp",
	".cxx": "cpp",
	".cc": "cpp",
	".hpp": "cpp",
	".hxx": "cpp",
	".cs": "csharp",
	".php": "php",
	".rb": "ruby",
	".rbw": "ruby",
	".go": "go",
	".rs": "rust",
	".swift": "plaintext",
	".kt": "plaintext",
	".scala": "plaintext",
	".r": "plaintext",

	// Database
	".sql": "sql",
	".sqlite": "sql",
	".db": "sql",

	// Config and scripts
	".sh": "bash",
	".bash": "bash",
	".zsh": "bash",
	".fish": "bash",
	".ps1": "powershell",
	".bat": "powershell",
	".cmd": "powershell",
	".dockerfile": "dockerfile",
	dockerfile: "dockerfile",
	".dockerignore": "plaintext",

	// Documentation
	".md": "markdown",
	".mdx": "markdown",
	".txt": "plaintext",
	".log": "plaintext",
	".csv": "plaintext",
	".tsv": "plaintext",

	// Other common files
	".gitignore": "plaintext",
	".env": "plaintext",
	".env.example": "plaintext",
	readme: "markdown",
	license: "plaintext",
	changelog: "markdown",
	contributing: "markdown",
};

// Function to detect language from file name or extension
export function detectLanguage(filename?: string, content?: string): SupportedLanguage {
	if (!filename && !content) {
		return "plaintext";
	}

	// First try to detect from filename
	if (filename) {
		const lowerFilename = filename.toLowerCase();

		// Check exact matches for files without extensions (like Dockerfile)
		if (EXTENSION_MAP[lowerFilename]) {
			return EXTENSION_MAP[lowerFilename];
		}

		// Extract extension from filename
		const lastDotIndex = lowerFilename.lastIndexOf(".");
		if (lastDotIndex !== -1) {
			const extension = lowerFilename.substring(lastDotIndex);
			if (EXTENSION_MAP[extension]) {
				return EXTENSION_MAP[extension];
			}
		}

		// Special cases for common patterns
		if (lowerFilename.includes("dockerfile")) {
			return "dockerfile";
		}
		if (lowerFilename.match(/^(\.env|\.env\.)|^readme|^license|^changelog|^contributing/)) {
			return "markdown";
		}
	}

	// Fallback to content-based detection if filename doesn't provide a clear answer
	if (content) {
		const trimmedContent = content.trim();

		// JSON detection
		if (
			(trimmedContent.startsWith("{") && trimmedContent.endsWith("}")) ||
			(trimmedContent.startsWith("[") && trimmedContent.endsWith("]"))
		) {
			try {
				JSON.parse(trimmedContent);
				return "json";
			} catch {
				// Not valid JSON, continue detection
			}
		}

		// XML/HTML detection
		if (trimmedContent.startsWith("<") && trimmedContent.endsWith(">")) {
			if (trimmedContent.includes("<!DOCTYPE") || trimmedContent.includes("<html")) {
				return "html";
			}
			if (trimmedContent.includes("<?xml")) {
				return "xml";
			}
			return "html"; // Default to HTML for generic tag content
		}

		// YAML detection
		if (trimmedContent.includes(": ") && !trimmedContent.includes("{")) {
			const lines = trimmedContent.split("\n").filter(line => line.trim());
			if (lines.length > 0 && lines.some(line => /^[a-zA-Z_][a-zA-Z0-9_]*:/.test(line))) {
				return "yaml";
			}
		}

		// CSS detection
		if (
			/[a-zA-Z-]+\s*:\s*[^;]+;/.test(trimmedContent) &&
			!trimmedContent.includes("function") &&
			!trimmedContent.includes("const ") &&
			!trimmedContent.includes("let ")
		) {
			return "css";
		}

		// JavaScript/TypeScript detection
		if (
			/(function|const|let|var|import|export|class|interface|type)/.test(trimmedContent) ||
			(trimmedContent.includes("=>") && trimmedContent.includes("{"))
		) {
			// Simple heuristic to differentiate between JS and TS
			if (/(interface|type\s+\w+\s*=|as\s+\w+|:.*=)/.test(trimmedContent)) {
				return "typescript";
			}
			return "javascript";
		}

		// Shell script detection
		if (
			trimmedContent.startsWith("#!/bin/bash") ||
			trimmedContent.startsWith("#!/bin/sh") ||
			/^\s*(export|echo|cd|ls|mkdir|rm|cp|mv|grep|awk|sed|for|while|if|then|fi)\s/.test(trimmedContent)
		) {
			return "bash";
		}

		// Python detection
		if (
			/^(import|from|def|class|if __name__)/m.test(trimmedContent) ||
			(trimmedContent.includes("def ") && trimmedContent.includes(":"))
		) {
			return "python";
		}
	}

	// Default fallback
	return "plaintext";
}

// Helper function to get file icon based on language
export function getFileIcon(language: SupportedLanguage): string {
	const iconMap: Record<SupportedLanguage, string> = {
		javascript: "javascript",
		typescript: "typescript",
		jsx: "react",
		tsx: "react",
		json: "json",
		css: "css",
		scss: "sass",
		html: "html",
		vue: "vue",
		svelte: "svelte",
		python: "python",
		java: "java",
		c: "c",
		cpp: "cpp",
		csharp: "csharp",
		php: "php",
		ruby: "ruby",
		go: "go",
		rust: "rust",
		sql: "database",
		yaml: "yaml",
		xml: "xml",
		markdown: "markdown",
		bash: "terminal",
		powershell: "terminal",
		dockerfile: "docker",
		plaintext: "file",
		text: "file",
	};

	return iconMap[language] || "file";
}
