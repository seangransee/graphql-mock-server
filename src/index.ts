import * as jsYaml from "js-yaml"
import { generateMockFunctions } from "./generateMockFunctions"
import { ObjectType, ObjectTypeMock } from "./types"

export function generateMockFunctionsFromYaml(yaml: string): ObjectType {
  return generateMockFunctions(<ObjectTypeMock>jsYaml.safeLoad(yaml))
}
