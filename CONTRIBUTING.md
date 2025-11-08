# Contributing to Unpako

Thank you for your interest in contributing to Unpako! This guide will help you get started with the development process.

## Development Setup

1. **Install dependencies**
   ```bash
   pnpm install
   ```

2. **Set up git hooks**
   ```bash
   pnpm prepare
   ```

3. **Start development server**
   ```bash
   pnpm dev
   ```

## Commit Message Format

This project uses [Conventional Commits](https://www.conventionalcommits.org/) to standardize commit messages and enable automated versioning and changelog generation.

### Format

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code (formatting, missing semi-colons, etc.)
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `perf`: Performance improvement
- `test`: Adding missing tests or correcting existing tests
- `build`: Changes that affect the build system or external dependencies
- `ci`: Changes to CI configuration files and scripts
- `chore`: Other changes that don't modify src or test files
- `revert`: Reverts previous commits

### Examples

```bash
feat(compression): add new deflate algorithm
fix: resolve memory leak in decompression
docs: update API documentation
style: format code with prettier
refactor(utils): extract shared logic to helper functions
test: add unit tests for compression module
chore: update dependencies
```

## Testing

Run all tests:
```bash
pnpm test
```

Run specific test types:
```bash
pnpm test:unit          # Unit tests
pnpm test:integration   # Integration tests
pnpm test:component     # Component tests
pnpm test:e2e          # End-to-end tests
pnpm test:coverage     # Test coverage report
```

## Code Quality

- **Type checking**: `pnpm typecheck`
- **Linting**: `pnpm lint`
- **Formatting**: Run `pnpm lint` which includes prettier formatting

## Pre-commit Hooks

This project uses Husky and lint-staged to automatically run code quality checks before commits. The following checks run on staged TypeScript files:

- ESLint with auto-fix
- Type checking
- All test suites

## Release Process

Releases are automated using semantic-release. When commits are pushed to the main branch:

1. All tests and quality checks run automatically
2. If all checks pass, semantic-release analyzes commit messages
3. Version is automatically bumped based on commit types:
   - `feat` → minor version
   - `fix` → patch version
   - BREAKING CHANGE → major version
   - All other conventional commits → patch version
4. GitHub release is created with auto-generated changelog

## Pull Request Process

1. Fork the repository
2. Create a feature branch from `main`
3. Make your changes following the commit message format
4. Ensure all tests pass and code quality checks are satisfied
5. Submit a pull request with a clear description

## Getting Help

If you need help or have questions:

- Check existing issues and discussions
- Create a new issue with detailed information
- Follow the template provided for issue reporting