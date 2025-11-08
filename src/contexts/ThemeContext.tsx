import { createContext, useState, useEffect } from "react";
import { MantineProvider, createTheme } from "@mantine/core";
import type { ReactNode } from "react";

export type ThemeMode = "system" | "light" | "dark";

interface ThemeContextType {
	theme: ThemeMode;
	effectiveTheme: "light" | "dark";
	toggleTheme: () => void;
	setTheme: (theme: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
	children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
	const [theme, setThemeState] = useState<ThemeMode>("system");
	const [effectiveTheme, setEffectiveTheme] = useState<"light" | "dark">("light");

	// Get system theme
	const getSystemTheme = (): "light" | "dark" => {
		if (typeof window !== "undefined" && window.matchMedia) {
			return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
		}
		return "light"; // Default to light if not available
	};

	// Update effective theme when theme state or system theme changes
	useEffect(() => {
		const updateEffectiveTheme = () => {
			if (theme === "system") {
				setEffectiveTheme(getSystemTheme());
			} else {
				setEffectiveTheme(theme as "light" | "dark");
			}
		};

		updateEffectiveTheme();

		// Listen for system theme changes when in system mode
		if (theme === "system" && typeof window !== "undefined") {
			const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
			mediaQuery.addEventListener("change", updateEffectiveTheme);

			return () => {
				mediaQuery.removeEventListener("change", updateEffectiveTheme);
			};
		}
	}, [theme]);

	// Load saved theme from localStorage
	useEffect(() => {
		const savedTheme = localStorage.getItem("unpako-theme") as ThemeMode;
		if (savedTheme && ["system", "light", "dark"].includes(savedTheme)) {
			setThemeState(savedTheme);
		}
	}, []);

	// Save theme to localStorage when it changes
	const setTheme = (newTheme: ThemeMode) => {
		setThemeState(newTheme);
		localStorage.setItem("unpako-theme", newTheme);
	};

	// Toggle through the 3 states: system → opposite → explicit system theme
	const toggleTheme = () => {
		const systemTheme = getSystemTheme();
		const oppositeTheme = systemTheme === "light" ? "dark" : "light";

		if (theme === "system") {
			// First click: switch to opposite of system theme
			setTheme(oppositeTheme);
		} else if (theme === oppositeTheme) {
			// Second click: switch to explicit system theme
			setTheme(systemTheme);
		} else {
			// Third click: switch back to system
			setTheme("system");
		}
	};

	const mantineTheme = createTheme({
		primaryColor: "blue",
		fontFamily:
			'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
	});

	const value: ThemeContextType = {
		theme,
		effectiveTheme,
		toggleTheme,
		setTheme,
	};

	return (
		<ThemeContext.Provider value={value}>
			<MantineProvider theme={mantineTheme} forceColorScheme={effectiveTheme}>
				{children}
			</MantineProvider>
		</ThemeContext.Provider>
	);
}

export { ThemeContext };
export type { ThemeContextType };
