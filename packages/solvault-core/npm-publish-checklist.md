# NPM Publication Checklist for `@solvault/core`

Follow these steps to publish `@solvault/core` to the npm registry:

### 1. Build Verification
Ensure the code builds cleanly without any TypeScript compilation errors:
```bash
npm run build
```

### 2. Run Test Suite
Verify that all unit tests pass:
```bash
npm run test
```

### 3. NPM Account Setup
If you do not have an npm account, register at [npmjs.com](https://www.npmjs.com/). Login via the CLI:
```bash
npm login
```

### 4. Scoped Package Visibility
Since this package is scoped (`@solvault/core`), it defaults to private. To publish it as a public package, you must specify the `--access public` flag on your first publish:
```bash
npm publish --access public
```

### 5. Future Releases
For subsequent releases, increment the version in `package.json` using semver rules before publishing:
```bash
# For bug fixes
npm version patch
# For new features
npm version minor
# For breaking changes
npm version major

# Then publish
npm publish
```
