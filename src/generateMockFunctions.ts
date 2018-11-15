import {
  ObjectTypeMock,
  ObjectType,
  Scalar,
  DeclaredFunction,
  Arguments
} from "./types"

import * as faker from "faker"
import * as casual from "casual"

function handleFunction(declaredFn: DeclaredFunction): Scalar {
  const fnName = declaredFn["function()"]
  const fnNameParsed = fnName.split(".")
  const libraryName = fnNameParsed[0]
  let library: object
  switch (libraryName) {
    case "faker":
      library = faker
      break
    case "casual":
      library = casual
      break
    default:
      throw Error(`${libraryName} is not a compatible library.`)
  }

  const fn: (...args: Arguments) => Scalar = fnNameParsed
    .slice(1)
    .reduce((f: any, key: string) => {
      return f[key]
    }, library)

  switch (typeof fn) {
    case "function":
      switch (typeof declaredFn.args) {
        case "object": // array
          return fn(...declaredFn.args)
        case "undefined":
          return fn()
        default:
          return fn(declaredFn.args)
      }
    case "undefined":
      throw Error(`${fnName} is not a valid function.`)
    default:
      return fn
  }
}

export function generateMockFunctions(mock: ObjectTypeMock): ObjectType {
  const objectType: ObjectType = {}

  for (const field in <ObjectTypeMock>mock) {
    const mockValue = (<ObjectTypeMock>mock)[field]

    if (typeof mockValue !== "object" || mockValue === null) {
      objectType[field] = () => <Scalar>mockValue
    } else if (Array.isArray(mockValue)) {
      if (typeof mockValue[0] !== "object") {
        objectType[field] = () => <Scalar[]>mockValue
      } else {
        objectType[field] = () =>
          (<ObjectTypeMock[]>mockValue).map(val =>
            generateMockFunctions(<ObjectTypeMock>val)
          )
      }
    } else if (mockValue["function()"]) {
      objectType[field] = () => handleFunction(<DeclaredFunction>mockValue)
    } else {
      objectType[field] = () => generateMockFunctions(<ObjectTypeMock>mockValue)
    }
    objectType[field]()
  }

  return objectType
}
