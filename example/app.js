// Ideas borrowed from:
// http://graphql.org/blog/mocking-with-graphql/

const express = require("express")
const graphiqlExpress = require("apollo-server-express").graphiqlExpress
const bodyParser = require("body-parser")
const {
  makeExecutableSchema,
  addMockFunctionsToSchema
} = require("graphql-tools")
const { graphql } = require("graphql")
const cors = require("cors")
const fs = require("fs")
const http = require("http")
const url = require("url")
const { generateMockFunctions } = require("../lib/index")

const app = express()
app.use(bodyParser.json())
app.use(cors({ origin: true, credentials: true }))
const server = http.createServer(app)
server.listen("8000")
console.log("GraphQL endpoint running in container at /graphql on port 8000.")

const generateResponse = ({ query, variables }) => {
  const schemaString = fs.readFileSync("./schema.graphql", "utf8")
  const schema = makeExecutableSchema({
    typeDefs: schemaString
  })

  const mocks = generateMockFunctions(fs.readFileSync("mocks.yaml", "utf8"))

  addMockFunctionsToSchema({ schema, mocks })
  return graphql({
    schema,
    source: query,
    variableValues: variables
  })
}

app.get("/", graphiqlExpress({ endpointURL: "/graphql" }))

app.get("/graphql", (req, res, next) => {
  const params = url.parse(req.url, true).query
  generateResponse(params).then(result => res.send(result))
})

app.post("/graphql", (req, res, next) => {
  const params = req.body
  generateResponse(params).then(result => res.send(result))
})
