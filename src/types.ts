export type Scalar = string | boolean | number | null

// { name: () => "Michael Scott" }
export interface ObjectType {
  [field: string]: Resolver
}

// () => "Michael Scott"
export type Resolver = () => ResolverValue

// { name: () => "Michael Scott" }
// [{ name: () => "Michael Scott" }, { name: () => "Dwight Schrute" }]
// 51
// [51, 52]
export type ResolverValue = ObjectType | ObjectType[] | Scalar | Scalar[]

// { name: "Michael Scott" }
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
