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

export function generateResolvers(mock: string): string
export function generateResolvers(mock: number): number
export function generateResolvers(mock: DeclaredFunction): Scalar | ObjectType[]
export function generateResolvers(mock: ObjectTypeMock): ObjectType
export function generateResolvers(mock: ObjectTypeMock[]): ObjectType[]
export function generateResolvers(mock: MockValue): ResolverValue {
  switch (typeof mock) {
    case "number":
      return <number>mock
    case "string":
      return <string>mock
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
          resolver[field] = () => generateResolvers(<number>mockValue)
          break
        case "string":
          resolver[field] = () => generateResolvers(<string>mockValue)
          break
        case "object":
          if (Array.isArray(mockValue)) {
            resolver[field] = () =>
              mockValue.map((val, i) => {
                return generateResolvers(val)
              })
          } else {
            // console.log(field)
            resolver[field] = () => generateResolvers(<ObjectTypeMock>mockValue)
          }
          break
      }
      return resolver
    },
    {}
  )
}
