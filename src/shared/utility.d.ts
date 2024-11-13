/**
 * Utility types
 */
export type Merge<T, R> = {
  [K in keyof T | keyof R]: K extends keyof R ? R[K] : K extends keyof T ? T[K] : never
}

export type Rename<T, Mappings extends Record<keyof Mappings, PropertyKey>> = {
  [K in keyof T as K extends keyof Mappings ? Mappings[K] : K]: T[K]
}

export type Modify<Type, Replacement extends Partial<Type>> = {
  [K in keyof Type]: K extends keyof Replacement ? Replacement[K] : Type[K]
}
