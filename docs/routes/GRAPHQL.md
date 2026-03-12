## GraphQL Route

This route file is responsible for separating incoming GraphQL requests into two domains: **authentication** and **game** operations.

Routing is organized under the `/graphql` prefix, followed by:

-  `/users` for authentication-related operations (user/account actions)
-  `/game` for game-related operations

In other words, every GraphQL request starts with `/graphql`, and the next path segment determines which schema and resolver set will handle the request:

-  `POST /graphql/users` → Auth/User GraphQL schema
-  `POST /graphql/game` → Game GraphQL schema

## Game Schema

The `gameSchema` defines the complete GraphQL API contract for the **game domain** (a tic-tac-toe–style game).  
It describes:

-  which **types** exist in the domain,
-  what **queries** (read operations) are available,
-  what **mutations** (write operations) can be executed.

---

### Enums (Fixed Value Sets)

These enums represent restricted sets of valid values used across the API.

-  **`GameStatus`**: `not_started | in_progress | won | lost | draw`  
   Represents the current state of the game.

-  **`Winner`**: `x | o | draw`  
   Represents the game result (winner or draw).

-  **`Order`**: `desc | asc`  
   Sorting direction for list queries.

-  **`Hardness`**: `very_easy | easy | medium | hard`  
   AI difficulty level.

-  **`Opponent`**: `computer | player`  
   Indicates whether the opponent is an AI or another player.

-  **`OrderField`**: `name | updatedAt`  
   Defines which field is used for ordering game lists.

---

### Input Type

-  **`LastMoveInput`**: `{ row, column }`  
   The client sends the last move using this shape (primarily for mutations).

---

### Object Types (Entities / Responses)

-  **`LastMove`**: `{ row, column }`  
   The last move representation returned by the API.

-  **`Region`**: `{ startRow, endRow, startColumn, endColumn }`  
   It represents the currently used (active) region of the game area.

-  **`AiMove`**: `{ winner, region, lastMove, board }`  
   Result returned from the AI move calculation:

   -  updated board
   -  computed last move
   -  winner (if game ended)
   -  optional winning region

-  **`Game`**: stored game entity containing:

   -  **Identifiers:** `gameId`, `userId`
   -  **Metadata:** `name`, `createdAt`, `updatedAt`
   -  **State:** `status`, `difficulty`, `opponent`, `size`
   -  **Gameplay data:** `board`, `lastMove`

-  **`Games`**: list response wrapper: `{ games, count }`
   -  `games`: array of `Game`
   -  `count`: total number of matches (useful for pagination)

---

### Queries (Read Operations)

-  **`game(gameId)`** → Fetch a single game by its ID.

-  **`games(userId, page, order, orderField, status?)`** → List games for a specific user with:

   -  pagination (`page`)
   -  sorting (`order`, `orderField`)
   -  optional filtering by `status`

-  **`checkBoard(board)`** → Evaluate a board and return:
   -  a `Winner` (`x`, `o`, `draw`)
   -  or `null` (if no winner yet)

---

### Mutations (Write Operations)

-  **`createGame(...)`** → Create a new game  
   Required fields:

   -  `userId`, `name`, `board`, `status`, `difficulty`, `opponent`, `size`  
      Optional:
   -  `lastMove`

-  **`deleteGame(gameId, userId)`** → Delete a game (scoped to the given user).

-  **`updateGame(...)`** → Partially update an existing game:

   -  name
   -  lastMove
   -  status
   -  board
   -  difficulty
   -  opponent
   -  size

-  **`aiMove(board, lastMove?, markup?, hardness)`** → Calculate the AI's next move and return an `AiMove`:
   -  updated board state
   -  computed last move
   -  winner (if applicable)
   -  optional winning region

---

### Summary

In short, the `gameSchema` covers both:

-  **game persistence and management** (CRUD + listing with pagination/sorting/filtering),
-  and **gameplay logic utilities** (board evaluation, AI move generation),

all exposed through GraphQL.

## Users Schema (Auth / User Domain)

This GraphQL schema defines the full API contract for the **user/authentication domain**.  
It describes the available user-related types, queries, and mutations used for registration, login, profile/stat updates, password management, and logout.

---

### Object Types

-  **`User`**  
   Represents a user account and its basic statistics.

   -  `userId`: unique identifier
   -  `email`: account email
   -  `winNumber`, `loseNumber`: game statistics
   -  `createdAt`, `updatedAt`: timestamps
   -  `game_count`: number of games saved by the user.

-  **`CsrfToken`**  
   A simple wrapper type for returning a CSRF token:

   -  `csrfToken: String!`

-  **`SignupResponse`**  
   Response returned after successful signup:
   -  `userId: ID!`

---

### Queries (Read Operations)

-  **`user(id: ID!): User!`**  
   Fetch a user by ID.

-  **`csrfToken: CsrfToken!`**  
   Returns a CSRF token (useful when the frontend needs to bootstrap CSRF protection).

-  **`checkPassword(userId: ID!, password: String!): Boolean`**  
   Verifies whether the provided password matches the user’s current password (often used before a password change).

---

### Mutations (Write Operations)

-  **`signup(email, password, confirmPassword): SignupResponse`**  
   Registers a new user account.

-  **`login(email, password): User`**  
   Logs in the user (typically session-based) and returns the user object.

-  **`updatedUser(userId, email?, winNumber?, loseNumber?): User`**  
   Partially updates user fields such as email and win/lose stats.

-  **`updatePassword(userId, password, newPassword, confirmPassword): User`**  
   Updates the user password after verifying the current password and confirmation.

-  **`logout: Boolean`**  
   Logs out the current user (usually destroys the session).

---

### Summary

In short, the **Users schema** provides a complete GraphQL interface for:

-  authentication (signup/login/logout),
-  user data retrieval,
-  updating user info and statistics,
-  password verification and password changes,
-  and CSRF token retrieval when needed.
