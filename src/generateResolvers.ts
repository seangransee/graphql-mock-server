import {
  ObjectTypeMock,
  ObjectType,
  ResolverValue,
  MockValue,
  Scalar,
  DeclaredFunction,
  Arguments
} from "./types"

import * as faker from "faker"

function handleFunction(declaredFn: DeclaredFunction): Scalar {
  const fnName = declaredFn.function.split(".")
  let library: object
  switch (fnName[0]) {
    case "faker":
      library = faker
      break
    default:
      return null
  }

  const fn: (options: Arguments) => Scalar = fnName
    .slice(1)
    .reduce((f: any, key: string) => {
      return f[key]
    }, library)

  if (fn !== undefined) {
    return fn(<Arguments>declaredFn)
  }

  return null
}

export function generateResolvers(mock: DeclaredFunction): Scalar
export function generateResolvers(mock: ObjectTypeMock): ObjectType
export function generateResolvers(mock: ObjectTypeMock[]): ObjectType[]
export function generateResolvers(mock: MockValue): ResolverValue {
  return Object.keys(<ObjectTypeMock>mock).reduce(
    (resolver: ObjectType, field: string) => {
      const mockValue = (<ObjectTypeMock>mock)[field]
      console.log(typeof mockValue, mockValue)
      switch (typeof mockValue) {
        case "number":
        case "string":
        case "boolean":
          resolver[field] = () => <Scalar>mockValue
          break
        case "object":
          if (mockValue === null) {
            resolver[field] = () => null
          } else if (Array.isArray(mockValue)) {
            resolver[field] = () => mockValue.map(val => generateResolvers(val))
          } else if ((<DeclaredFunction>mockValue).function) {
            resolver[field] = () => handleFunction(<DeclaredFunction>mockValue)
          } else {
            resolver[field] = () => generateResolvers(<ObjectTypeMock>mockValue)
          }
      }
      return resolver
    },
    {}
  )
}
