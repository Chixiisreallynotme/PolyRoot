// via setup-ts-deep-modules: Deep Modules 163K + codebase-design Seam/Depth — 5 rules severity:error
/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'entrypoint-boundary-from-app',
      comment: 'App must import packages via entrypoint ONLY — NEVER ../lib/ from outside',
      severity: 'error',
      from: { path: '^src/', pathNot: '^src/packages/' },
      to: { path: '^src/packages/[^/]+/(lib|tests)/' },
    },
    {
      name: 'entrypoint-boundary-across-packages',
      comment: 'Packages lib/tests must import other packages via entrypoint ONLY — own lib allowed from index',
      severity: 'error',
      from: { path: '^src/packages/[^/]+/(lib|tests)/' },
      to: { path: '^src/packages/[^/]+/(lib|tests)/' },
    },
    {
      name: 'tests-through-entrypoints',
      comment: 'Tests must import via ../index ONLY — NEVER lib/ direct',
      severity: 'error',
      from: { path: '^src/packages/[^/]+/tests/' },
      to: { path: '^src/packages/[^/]+/lib/' },
    },
    {
      name: 'tests-folder-is-private',
      comment: 'NEVER import tests/ from outside package',
      severity: 'error',
      from: { path: '^src/', pathNot: '^src/packages/[^/]+/tests/' },
      to: { path: '^src/packages/[^/]+/tests/' },
    },
    {
      name: 'no-circular',
      comment: 'No circular dependencies',
      severity: 'error',
      from: {},
      to: { circular: true },
    },
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    tsConfig: { fileName: 'tsconfig.json' },
  },
}
