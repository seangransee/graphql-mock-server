import {
  ObjectTypeMock,
  ObjectType,
  Scalar,
  DeclaredFunction,
  Arguments
} from "./types"

import * as faker from "faker"

function handleFunction(declaredFn: DeclaredFunction): Scalar {
  const fnName = declaredFn["function()"]
  const fnNameParsed = fnName.split(".")
  const libraryName = fnNameParsed[0]
  let library: object
  switch (libraryName) {
    case "faker":
      library = faker
      break
    default:
      throw Error(`${libraryName} is not a compatible library.`)
  }

  const fn: (...args: Arguments) => Scalar = fnNameParsed
    .slice(1)
    .reduce((f: any, key: string) => {
      return f[key]
    }, library)

  const args = declaredFn.args || []

  if (fn !== undefined) {
    return fn(...args)
  }

  return null
}

export function generateMockFunctions(mock: ObjectTypeMock): ObjectType {
  const objectType: ObjectType = {}

  for (const field in <ObjectTypeMock>mock) {
    const mockValue = (<ObjectTypeMock>mock)[field]

    if (typeof mockValue !== "object" || mockValue === null) {
      objectType[field] = () => <Scalar>mockValue
    } else if (Array.isArray(mockValue)) {
      objectType[field] = () =>
        mockValue.map(val => generateMockFunctions(<ObjectTypeMock>val))
    } else if (mockValue["function()"]) {
      objectType[field] = () => handleFunction(<DeclaredFunction>mockValue)
    } else {
      objectType[field] = () => generateMockFunctions(<ObjectTypeMock>mockValue)
    }
    objectType[field]()
  }

  return objectType
}
