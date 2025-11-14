import { buildSchema } from "graphql";

const gameSchema = buildSchema(`

  # ---------- ENUMS ----------
  enum GameStatus {
    not_started
    in_progress
    won
    lost
    draw
  }

  enum Winner {
    x
    o
    draw
  }

  enum Order {
    desc
    asc
  }

  enum Hardness {
    very_easy
    easy
    medium
    hard
  }

  # ---------- INPUT TYPES ----------
  input LastMoveInput {
    row: Int
    column: Int
  }

  # ---------- OBJECT TYPES ----------
  type LastMove {
    row: Int
    column: Int
  }

  type Region {
    startRow: Int
    endRow: Int
    startColumn: Int
    endColumn: Int
  }

  type AiMove {
    winner: Winner
    region: Region
    lastMove: LastMove
    board: [[String!]!]
  }

  type Game {
    gameId: ID!
    lastMove: LastMove
    status: GameStatus!
    userId: ID!
    createdAt: String!
    updatedAt: String
    board: [[String!]!]
  }

  # ---------- QUERIES ----------
  type RootQuery {
    getGameById_graphql(gameId: ID!): Game!
    getGamesByUserId_graphql(
      userId: ID!
      page: Int!
      order: Order
    ): [Game]!

    checkBoard_graphql(board:[[String!]!]):Winner
  }

  # ---------- MUTATIONS ----------
  type RootMutation {
    createGame_graphql(
      userId: ID!
      board: [[String!]!]!
      lastMove: LastMoveInput
      status: GameStatus
    ): Game!

    deleteGame_graphql(
      gameId: ID!
      userId: ID!
    ): Game!

    updateGame_graphql(
      gameId: ID!
      lastMove: LastMoveInput
      status: GameStatus
      board: [[String!]!]!
    ): Game!

    aiMove_graphql(
      board: [[String!]!]!
      lastMove: LastMoveInput
      markup: String
      hardness: Hardness!
    ): AiMove
  }

  # ---------- SCHEMA ----------
  schema {
    query: RootQuery
    mutation: RootMutation
  }

`);

export default gameSchema;
