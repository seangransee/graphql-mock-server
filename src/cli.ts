#!/usr/bin/env node

// Ideas borrowed from:
// http://graphql.org/blog/mocking-with-graphql/

import * as express from "express"
import { graphiqlExpress } from "apollo-server-express"
import * as bodyParser from "body-parser"
import { makeExecutableSchema, addMockFunctionsToSchema } from "graphql-tools"
import { graphql } from "graphql"
import * as cors from "cors"
import * as fs from "fs"
import * as http from "http"
import * as url from "url"
import { generateMockFunctionsFromYaml } from "./index"

const app = express()
app.use(bodyParser.json())
app.use(cors({ origin: true, credentials: true }))
const server = http.createServer(app)
server.listen("8000")
console.log("GraphQL endpoint running in container at /graphql on port 8000.")

const mocks = generateMockFunctionsFromYaml(
  fs.readFileSync("mocks.yaml", "utf8")
)

const generateResponse = ({
  query,
  variables
}: {
  query: string
  variables: object
}) => {
  const schemaString = fs.readFileSync("./schema.graphql", "utf8")
  const schema = makeExecutableSchema({
    typeDefs: schemaString
  })

  addMockFunctionsToSchema({ schema, mocks })
  return graphql({
    schema,
    source: query,
    variableValues: variables
  })
}

app.get("/", graphiqlExpress({ endpointURL: "/graphql" }))

app.get("/graphql", (req, res, next) => {
  const params = <{ query: string; variables: object }>(
    url.parse(req.url, true).query
  )
  generateResponse(params).then(result => res.send(result))
})

app.post("/graphql", (req, res, next) => {
  const params = <{ query: string; variables: object }>req.body
  generateResponse(params).then(result => res.send(result))
})
