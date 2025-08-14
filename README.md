# coverage-badge-svg

Create SVG badges from code coverage reports, with support for monorepo.

[![Docs](https://img.shields.io/badge/Docs-read-%23fdf9f5)](https://crimx.github.io/coverage-badge-svg/)
[![Build Status](https://github.com/crimx/coverage-badge-svg/actions/workflows/build.yml/badge.svg)](https://github.com/crimx/coverage-badge-svg/actions/workflows/build.yml)
[![npm-version](https://img.shields.io/npm/v/coverage-badge-svg.svg)](https://www.npmjs.com/package/coverage-badge-svg)

## Usage

Generate coverage with `json-summary` reporter enabled. For example, with [vitest](https://vitest.dev/guide/reporters) `vitest --coverage.enabled --coverage.reporter='json-summary'`.

```bash
npx coverage-badge-svg --out ./docs/coverage
```

### Usage in package

1. Install the package:
   ```bash
   npm install coverage-badge-svg --save-dev
   ```
2. package.json:
   ```json
   {
     "scripts": {
       "coverage-badge": "coverage-badge-svg --out ./docs/coverage"
     }
   }
   ```
