# Unpako

A React + TypeScript web application that enables file sharing via compressed URLs. Files are compressed using pako (zlib), base64-encoded, and embedded in URL parameters, allowing direct sharing without external storage.

## Features

- **Zero Storage**: Files are compressed and encoded directly into URLs
- **No Backend**: Completely client-side application
- **File History**: Local storage with IndexedDB for recent files
- **PWA Support**: Installable as a desktop app with offline capabilities
- **Syntax Highlighting**: Code highlighting with Shiki
- **Theme System**: System, light, and dark mode support
- **Export/Import**: Backup and restore file history

## Quick Start

```bash
# Install dependencies
pnpm install

# Start development server (port 5174)
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

## Development

### Code Quality

```bash
pnpm lint              # ESLint with strict rules
pnpm typecheck         # TypeScript type checking
```

### Testing

```bash
pnpm test              # Run all tests
pnpm test:unit         # Unit tests only
pnpm test:integration  # Integration tests only
pnpm test:component    # Component tests only
pnpm test:e2e          # Playwright E2E tests
pnpm test:ui           # Vitest UI
pnpm test:coverage     # Coverage report
```

## How It Works

1. **File Upload**: Files are compressed using pako (zlib), base64-encoded, and stored in URL parameters
2. **URL Sharing**: The compressed data is embedded directly in the URL, eliminating the need for external storage
3. **File Loading**: When someone opens the URL, the application decodes and decompresses the file data
4. **Local History**: Files are also stored locally in IndexedDB for easy access

## URL Format

**New format**: `?filepath=...&createdAt=...&modifiedAt=...&data=...`

**Legacy formats**: Backward compatibility with old timestamp and name parameters

## Technologies

- **Frontend**: React 19.1.1 + TypeScript 5.9.3
- **Build**: Vite 7.1.7
- **UI**: Mantine v8.3.6 + Vanilla Extract CSS-in-JS
- **Storage**: IndexedDB via Dexie v4.2.1
- **Compression**: Pako (zlib) + base64 encoding
- **Testing**: Vitest + Playwright
- **PWA**: Vite PWA plugin with service worker

## Deployment

The application is configured for deployment to GitHub Pages via GitHub Actions. The CI/CD pipeline runs all tests, builds the application, and automatically deploys to the main branch.

## License

MIT
