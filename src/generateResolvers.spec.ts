import { generateResolvers } from "./generateResolvers"
import { ObjectType, Scalar, Resolver } from "./types"
import * as fs from "fs"

describe("generateResolvers", () => {
  it("works with a mock", () => {
    expect(generateResolvers({ name: "Sean" }).name()).toEqual("Sean")
  })
  it("works with a nested mock", () => {
    expect(
      (<ObjectType>generateResolvers({ User: { name: "Sean" } }).User()).name()
    ).toEqual("Sean")
  })
  it("works with a list", () => {
    const resolvers = generateResolvers({
      users: [{ name: "Sean" }, { name: "Colin" }]
    })
    const users = <ObjectType[]>resolvers.users()
    expect(users[0].name()).toEqual("Sean")
    expect(users[1].name()).toEqual("Colin")
  })
  it("works with a faker function", () => {
    const resolvers = generateResolvers({
      age: { "function()": "faker.random.number", min: 51, max: 51 }
    })
    expect(resolvers.age()).toEqual(51)
  })
})
