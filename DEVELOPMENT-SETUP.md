# Development Setup - Phase 1 Complete ✅

## What's Been Set Up

### 1. Development Dependencies

- **@shopify/cli** - Shopify CLI for theme development
- **@shopify/theme-check-node** - Liquid theme linting
- **ESLint** - JavaScript linting
- **Prettier** - Code formatting
- **Stylelint** - CSS linting
- **Husky** - Git hooks
- **lint-staged** - Pre-commit checks

### 2. Configuration Files

- `.eslintrc.json` - ESLint rules for JavaScript
- `.prettierrc` - Prettier formatting rules
- `.prettierignore` - Files to skip formatting (includes Liquid files)
- `.stylelintrc.json` - Stylelint rules for CSS
- `.lintstagedrc.json` - Pre-commit check configuration
- `.husky/pre-commit` - Git pre-commit hook

### 3. NPM Scripts

```bash
npm run lint:js         # Lint JavaScript files
npm run lint:css        # Lint CSS files
npm run lint:theme      # Run Shopify Theme Check
npm run lint            # Run all linters
npm run format          # Format JS, CSS, JSON, MD files
npm run format:check    # Check formatting without changes
```

### 4. Git Hooks

Pre-commit hook automatically runs:

- ESLint on staged `.js` files
- Stylelint on staged `.css` files
- Prettier on staged `.js`, `.css`, `.json`, `.md` files

### 5. CI/CD

GitHub Actions workflow (`.github/workflows/ci.yml`) runs on:

- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`

The workflow runs all linting and formatting checks.

## Usage

### Local Development

**Run all checks:**

```bash
npm run lint
npm run format:check
```

**Auto-fix issues:**

```bash
npm run format
```

**Individual checks:**

```bash
npm run lint:js       # Check JavaScript
npm run lint:css      # Check CSS
npm run lint:theme    # Check Liquid files
```

### Pre-commit Hook

The hook runs automatically when you commit. If checks fail, the commit will be blocked until you fix the issues.

To bypass (not recommended):

```bash
git commit --no-verify -m "message"
```

### Important Notes

1. **Liquid files are NOT formatted by Prettier** - They use Theme Check instead due to complex syntax with dynamic tags
2. **Theme Check warnings** - The theme has some existing warnings that are informational
3. **CI Pipeline** - All PRs must pass linting before merge

## Next Steps (Phase 2+)

- [ ] Set up theme development environment
- [ ] Configure Shopify CLI
- [ ] Set up local development store
- [ ] Document theme customization workflow
- [ ] Add testing framework (if needed)

## Troubleshooting

**Husky not working?**

```bash
npm run prepare
```

**Linting errors in existing code?**
The theme has some pre-existing warnings from Theme Check. Focus on new code being compliant.

**Need to update dependencies?**

```bash
npm update
```
