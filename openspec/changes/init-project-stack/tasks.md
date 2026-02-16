## 1. Project Configuration

- [ ] 1.1 Create `package.json` with name, type "module", engine >=20.0.0, and all npm scripts (build, dev, test, lint, format, typecheck)
- [ ] 1.2 Create `tsconfig.json` targeting ES2022 with ESNext modules, bundler resolution, strict mode, and outDir "dist"
- [ ] 1.3 Create `.env.example` with `OPENAI_API_KEY=`

## 2. Dependencies

- [ ] 2.1 Install runtime dependencies: fast-xml-parser, openai, commander, p-limit, dotenv
- [ ] 2.2 Install dev dependencies: typescript, tsup, tsx, vitest, eslint, prettier, typescript-eslint, @types/node

## 3. Code Quality Configuration

- [ ] 3.1 Create `eslint.config.js` with typescript-eslint flat config for src/ TypeScript files
- [ ] 3.2 Create `.prettierrc` with semi, singleQuote, and trailingComma settings

## 4. Source Scaffolding

- [ ] 4.1 Create `src/types.ts` exporting Outline, Chapter, and Section interfaces
- [ ] 4.2 Create `src/parser.ts` with placeholder module stub
- [ ] 4.3 Create `src/generator.ts` with placeholder module stub
- [ ] 4.4 Create `src/writer.ts` with placeholder module stub
- [ ] 4.5 Create `src/index.ts` CLI entry point stub with Commander setup

## 5. Build Configuration

- [ ] 5.1 Create `tsup.config.ts` targeting ESM output from src/index.ts

## 6. Test Setup

- [ ] 6.1 Create `vitest.config.ts` with test directory set to tests/
- [ ] 6.2 Create `tests/types.test.ts` with a basic smoke test for type exports

## 7. PR Verification Workflow

- [ ] 7.1 Create `.github/workflows/pr-verify.yml` with parallel typecheck, lint, and test jobs on Node.js 20 with npm caching

## 8. Validation

- [ ] 8.1 Verify `npm run typecheck` passes
- [ ] 8.2 Verify `npm run lint` passes
- [ ] 8.3 Verify `npm test` passes
- [ ] 8.4 Verify `npm run build` produces dist/index.js
