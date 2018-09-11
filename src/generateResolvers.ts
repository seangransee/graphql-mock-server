import {
  ObjectTypeMock,
  ObjectType,
  Scalar,
  DeclaredFunction,
  Arguments
} from "./types"

import * as faker from "faker"

function handleFunction(declaredFn: DeclaredFunction): Scalar {
  const fnName = declaredFn["function()"].split(".")
  let library: object
  switch (fnName[0]) {
    case "faker":
      library = faker
      break
    default:
      return null
  }

  const fn: (...args: Arguments) => Scalar = fnName
    .slice(1)
    .reduce((f: any, key: string) => {
      return f[key]
    }, library)

  if (fn !== undefined) {
    return fn(...declaredFn.args)
  }

  return null
}

export function generateResolvers(mock: ObjectTypeMock): ObjectType {
  const objectType: ObjectType = {}

  for (const field in <ObjectTypeMock>mock) {
    const mockValue = (<ObjectTypeMock>mock)[field]

    if (typeof mockValue !== "object" || mockValue === null) {
      objectType[field] = () => <Scalar>mockValue
    } else if (Array.isArray(mockValue)) {
      objectType[field] = () =>
        mockValue.map(val => generateResolvers(<ObjectTypeMock>val))
    } else if (mockValue["function()"]) {
      objectType[field] = () => handleFunction(<DeclaredFunction>mockValue)
    } else {
      objectType[field] = () => generateResolvers(<ObjectTypeMock>mockValue)
    }
  }

  return objectType
}
