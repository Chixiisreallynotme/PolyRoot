// via typescript-advanced-types: Brand<T,Name> + Result<T,E> — via codebase-design Depth

export type Brand<T, Name extends string> = T & { readonly __brand: Name }

export type ChipId = Brand<string, 'ChipId'>
export type EntityId = Brand<string, 'EntityId'>
export type PlayerId = Brand<string, 'PlayerId'>

export type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E }

export function ok<T>(value: T): Result<T, never> {
  return { ok: true, value }
}
export function err<E>(error: E): Result<never, E> {
  return { ok: false, error }
}

// Example usages required ≥5 — see heating, collision, spawn, player, crypto
