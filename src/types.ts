export type Scalar = string | boolean | number | null

export interface ObjectType {
  [field: string]: Resolver
}
export type Resolver = () => ResolverValue
export type ResolverValue = ObjectType | ObjectType[] | Scalar | Scalar[]

export interface ObjectTypeMock {
  [field: string]: MockValue
}
export interface DeclaredFunction {
  "function()": string
  args: Arguments
}
export type MockValue =
  | ObjectTypeMock
  | ObjectTypeMock[]
  | DeclaredFunction
  | Scalar
  | Scalar[]

export type Arguments = (object | Scalar)[]
