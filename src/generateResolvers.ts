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

export function generateResolvers(mock: DeclaredFunction): Scalar | ObjectType[]
export function generateResolvers(mock: ObjectTypeMock): ObjectType
export function generateResolvers(mock: ObjectTypeMock[]): ObjectType[]
export function generateResolvers(mock: MockValue): ResolverValue {
  switch (typeof mock) {
    case "object":
      if ((<DeclaredFunction>mock).function) {
        return handleFunction(<DeclaredFunction>mock)
      }
  }
  return Object.keys(<ObjectTypeMock>mock).reduce(
    (resolver: ObjectType, field: string) => {
      const mockValue = (<ObjectTypeMock>mock)[field]
      switch (typeof mockValue) {
        case "number":
          resolver[field] = () => <number>mockValue
          break
        case "string":
          resolver[field] = () => <string>mockValue
          break
        case "boolean":
          resolver[field] = () => <boolean>mockValue
          break
        case "object":
          if (Array.isArray(mockValue)) {
            resolver[field] = () =>
              mockValue.map((val, i) => {
                return generateResolvers(val)
              })
          } else {
            resolver[field] = () => generateResolvers(<ObjectTypeMock>mockValue)
          }
          break
      }
      return resolver
    },
    {}
  )
}
