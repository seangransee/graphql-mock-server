import * as jsYaml from "js-yaml"
import { generateResolvers } from "./generateResolvers"
import { ObjectType, ObjectTypeMock } from "./types"

export function generateMockFunctions(yaml: string): ObjectType {
  return generateResolvers(<ObjectTypeMock>jsYaml.safeLoad(yaml))
}
