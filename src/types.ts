export type Scalar = string | boolean | number | null

export interface ObjectType {
  [field: string]: Resolver
}
export type Resolver = () => ResolverValue
export type ResolverValue = ObjectType | ObjectType[] | Scalar

export interface ObjectTypeMock {
  [field: string]: MockValue
}
export interface DeclaredFunction {
  function: string
  [arg: string]: Scalar
}
export type MockValue =
  | ObjectTypeMock
  | ObjectTypeMock[]
  | DeclaredFunction
  | Scalar

export interface Arguments {
  [arg: string]: Scalar
}
