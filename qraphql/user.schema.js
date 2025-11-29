import { buildSchema } from "graphql";

const schema = buildSchema(`

  # ---------- OBJECT TYPES ----------
  type User {
    userId: ID!
    email: String!
    winNumber: Int!
    loseNumber: Int!
    createdAt: String!
    updatedAt: String!
    game_count: Int!
  }

  type CsrfToken {
    csrfToken: String!
  }

  type SignupResponse {
    userId: ID!
  }

  # ---------- QUERIES ----------
  type RootQuery {
    user(id: ID!): User!
    csrfToken: CsrfToken!
  }

  # ---------- MUTATIONS ----------
  type RootMutation {
    signup(
      email: String!
      password: String!
      confirmPassword: String!
    ): SignupResponse

    login(
      email: String!
      password: String!
    ): User

    updatedUser(
      userId: ID!
      email: String
      winNumber: Int
      loseNumber: Int
    ): User

    logout: Boolean
  }

  # ---------- SCHEMA ----------
  schema {
    query: RootQuery
    mutation: RootMutation
  }

`);

export default schema;
