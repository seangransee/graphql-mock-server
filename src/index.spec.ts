import { generateMockFunctionsFromYaml } from "."
import { ObjectType, ObjectTypeMock, Resolver } from "./types"

describe("generateMockFunctionsFromYaml", () => {
  it("handles strings", () => {
    const yaml = `
      name: Michael Scott
    `

    expect(generateMockFunctionsFromYaml(yaml).name()).toEqual("Michael Scott")
  })

  it("handles numbers", () => {
    const yaml = `
      age: 51
    `

    expect(generateMockFunctionsFromYaml(yaml).age()).toEqual(51)
  })

  it("handles nested object types", () => {
    const yaml = `
      User:
        friend:
          name: Dwight Schrute
    `

    const User = <ObjectType>generateMockFunctionsFromYaml(yaml).User()
    const friend = <ObjectType>User.friend()
    expect(friend.name()).toEqual("Dwight Schrute")
  })

  it("handles lists of objects", () => {
    const yaml = `
      friends:
        - name: Michael Scott
        - name: Dwight Schrute
    `

    const friends = <ObjectType[]>generateMockFunctionsFromYaml(yaml).friends()
    expect(friends.map(f => f.name())).toEqual([
      "Michael Scott",
      "Dwight Schrute"
    ])
  })

  it("handles lists of scalars", () => {
    const yaml = `
      numbers:
        - 10
        - 20
        - 30
    `

    const numbers = <ObjectType[]>generateMockFunctionsFromYaml(yaml).numbers()
    expect(numbers).toEqual([10, 20, 30])
  })

  it("throws an error generating resolvers with an invalid library", () => {
    const yaml = `
      age:
        function(): invalidLibrary.function
    `

    expect(() => generateMockFunctionsFromYaml(yaml)).toThrow(
      Error("invalidLibrary is not a compatible library.")
    )
  })

  it("throws an error generating resolvers with an invalid function", () => {
    const yaml = `
      age:
        function(): faker.invalidFunction
    `

    expect(() => generateMockFunctionsFromYaml(yaml)).toThrow(
      Error("faker.invalidFunction is not a valid function.")
    )
  })

  it("handles a faker function without arguments", () => {
    const yaml = `
      age:
        function(): faker.random.number
    `

    const resolvers = generateMockFunctionsFromYaml(yaml)
    expect(typeof resolvers.age()).toBe("number")
  })

  it("handles a faker function with a scalar argument", () => {
    const yaml = `
      age:
        function(): faker.random.number
        args: 10
    `

    const resolvers = generateMockFunctionsFromYaml(yaml)
    const age = resolvers.age()
    expect(age).toBeLessThanOrEqual(10)
  })

  it("handles a faker function with a scalar argument provided in a list", () => {
    const yaml = `
      age:
        function(): faker.random.number
        args:
          - 10
    `

    const resolvers = generateMockFunctionsFromYaml(yaml)
    const age = resolvers.age()
    expect(age).toBeLessThanOrEqual(10)
  })

  it("handles a faker function with an object argument", () => {
    const yaml = `
      age:
        function(): faker.random.number
        args:
          - min: 51
            max: 53
    `

    const resolvers = generateMockFunctionsFromYaml(yaml)
    const age = resolvers.age()
    expect(age).toBeGreaterThanOrEqual(51)
    expect(age).toBeLessThanOrEqual(53)
  })

  it("handles a faker function with an array argument", () => {
    const yaml = `
      name:
        function(): faker.random.arrayElement
        args:
          - - Michael
            - Dwight
    `
    const resolvers = generateMockFunctionsFromYaml(yaml)
    const name = resolvers.name()
    expect(["Michael", "Dwight"].includes(<string>name)).toBeTruthy()
  })

  it("handles a casual generator that's not a function", () => {
    const yaml = `
      bool:
        function(): casual.coin_flip
    `

    const resolvers = generateMockFunctionsFromYaml(yaml)
    const bool = resolvers.bool()
    expect(typeof bool).toBe("boolean")
  })

  it("handles a casual function", () => {
    const yaml = `
      words:
        function(): casual.array_of_words
        args: 5
    `

    const resolvers = generateMockFunctionsFromYaml(yaml)
    const words = <string[]>resolvers.words()
    expect((<string[]>words).length).toBe(5)
  })
})
