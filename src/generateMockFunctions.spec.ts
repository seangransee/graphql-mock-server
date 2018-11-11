import { generateMockFunctions } from "./generateMockFunctions"
import { ObjectType } from "./types"

describe("generateResolvers", () => {
  it("works with a string", () => {
    expect(generateMockFunctions({ name: "Sean" }).name()).toEqual("Sean")
  })

  it("works with a number", () => {
    expect(generateMockFunctions({ age: 51 }).age()).toEqual(51)
  })

  it("works with a nested mock", () => {
    expect(
      (<ObjectType>(
        generateMockFunctions({ User: { name: "Sean" } }).User()
      )).name()
    ).toEqual("Sean")
  })

  it("works with a list", () => {
    const resolvers = generateMockFunctions({
      users: [{ name: "Sean" }, { name: "Colin" }]
    })
    const users = <ObjectType[]>resolvers.users()
    expect(users[0].name()).toEqual("Sean")
    expect(users[1].name()).toEqual("Colin")
  })

  it("throws an error while generating resolvers with an invalid library", () => {
    expect(() =>
      generateMockFunctions({
        age: { "function()": "invalidLibrary.function" }
      })
    ).toThrow(Error("invalidLibrary is not a compatible library."))
  })

  it("works with a faker function without arguments", () => {
    const resolvers = generateMockFunctions({
      age: { "function()": "faker.random.number" }
    })
    expect(typeof resolvers.age()).toBe("number")
  })

  it("works with a faker function with an argument", () => {
    const resolvers = generateMockFunctions({
      age: { "function()": "faker.random.number", args: [{ min: 51, max: 59 }] }
    })
    expect(resolvers.age()).toBeGreaterThan(50)
    expect(resolvers.age()).toBeLessThan(60)
  })
})
