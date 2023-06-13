# ts-lib-starter

TypeScript Library Starter for DAOT projects

## Usage

Install dependencies:
```sh
pnpm install
```

Commit changes with [Commitizen](https://commitizen.github.io/cz-cli/):
```sh
npx cz
```

Or still use `git commit` and follow [the Conventional Commits spec](https://www.conventionalcommits.org/en/v1.0.0/#summary), your commits will be linted before accepted.

To run `Jest` test:
```sh
pnpm test
```

To lint with `Rome`:
```sh
pnpm lint
```

To build with `tsup`:
```sh
pnpm build
```

To publish to npm:
```sh
pnpm pub
```

To debug with `ts-node`:
```sh
ts-node-esm -r tsconfig-paths/register src/index.ts
```
