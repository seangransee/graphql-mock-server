import { generateMockFunctionsFromYaml } from "."
import { ObjectType, ObjectTypeMock, Resolver } from "./types"

describe("generateMockFunctions", () => {
  it("generates mocks from YAML", () => {
    const yaml = `
      User:
        name: Nicolas Cage
    `

    const User = <ObjectType>generateMockFunctionsFromYaml(yaml).User()
    expect(User.name()).toEqual("Nicolas Cage")
  })
})
