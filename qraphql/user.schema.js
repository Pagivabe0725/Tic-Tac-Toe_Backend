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
  }

  type CsrfToken {
    csrfToken: String!
  }

  type SignupResponse {
    userId: ID!
  }

  # ---------- QUERIES ----------
  type RootQuery {
    getUserById_graphql(id: ID!): User!
    getCsrfToken_graphql: CsrfToken!
  }

  # ---------- MUTATIONS ----------
  type RootMutation {
    signup_graphql(
      email: String!
      password: String!
      confirmPassword: String!
    ): SignupResponse

    login_graphql(
      email: String!
      password: String!
    ): User

    updatedUser_graphql(
      userId: ID!
      email: String
      winNumber: Int
      loseNumber: Int
    ): User

    logout_graphql: Boolean
  }

  # ---------- SCHEMA ----------
  schema {
    query: RootQuery
    mutation: RootMutation
  }

`);

export default schema;
