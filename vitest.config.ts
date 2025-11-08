import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
	plugins: [react()],
	test: {
		globals: true,
		environment: 'jsdom',
		setupFiles: ['./src/test/setup.ts'],
		include: [
			'src/**/*.unit.test.{ts,tsx}',
			'src/**/*.integration.test.{ts,tsx}',
			'src/**/*.component.test.{ts,tsx}'
		],
		exclude: [
			'node_modules',
			'dist',
			'src/**/*.e2e.test.{ts,tsx}'
		],
		coverage: {
			provider: 'v8',
			reporter: ['text', 'json', 'html'],
			exclude: [
				'node_modules/',
				'src/test/',
				'**/*.d.ts',
				'**/*.config.*',
				'dist/'
			]
		}
	},
	resolve: {
		alias: {
			'@': resolve(__dirname, './src')
		}
	}
})