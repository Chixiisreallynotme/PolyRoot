# PolyRoot : Escape from PS1 — Deep Modules — via setup-ts-deep-modules + codebase-design

> Layout: `src/packages/<name>/{index.ts (entry public seul import autorisé), lib/impl.ts (privé), tests/*.test.ts (via ../index ONLY)}`
> Vocab: `Module/Interface/Seam/Adapter/Depth/Leverage/Locality` — NEVER component/service

## Packages

- `core` — ObjectPool, Result, Brand
- `heating` — HeatingSystem seam critique freeze mobile 3.5s
- `collision` — SpatialGrid 8x8 277k→68
- `spawn` — SpawnSystem 8/20 seededShuffle
- `player` — Movement ZQSD+dash
- `crypto` — AI data-driven enemies.json
- `puce` — Puce logic + HELP ME binary
- `boss` — Boss 2 phases 35s
- `render` — PS1Pass wrapper deep
- `example` — template

## Rules (4 + no barrels)

1. NEVER `export *` barrel — explicit re-export only
2. NEVER importer `../lib/` depuis dehors — via `../index` entry only
3. NEVER `tests/` depuis autre package — private
4. MUST `npm run lint:boundaries` vert preuve clean→deep-import-fail→revert-pass
5. `package.json check = tsc --noEmit && lint:boundaries && vitest run` MUST vert

## Pointer

See `CLAUDE.md` for seams and `GATES.md` for OWNS.

## via setup-ts-deep-modules
