# Tic tac toe backend

## Quick summary

The application can be divided into three main parts:

-  [auth](/docs/routes/AUTH.md): responsible for user management (authentication, sessions, account-related features)
-  [game](/docs/routes/GAME.md): responsible for executing gameplay-related operations — primarily implementing difficulty-based logic, handling the opponent’s moves, and performing database operations related to saved games
-  [graphql](/docs/routes/GRAPHQL.md): provides a GraphQL layer for querying and interacting with application data

There is a `routes` folder that connects the different endpoints to the operations they are expected to perform. There is also a `graphql` folder that contains the various **schemas** and **resolvers**. Finally, the `controllers` folder contains the functions that implement the logic behind each endpoint.

The application uses a **MySQL** database, accessed through **Sequelize** as the ORM layer.

All database-related models are located in the `models` folder. These models represent the database tables and define:

-  table structure (fields / column types)
-  relationships between entities (associations)
-  validation and constraints (where applicable)

Using [Sequelize](https://sequelize.org/) makes it easier to perform database operations (create, read, update, delete) in a consistent, type-safe way without writing raw SQL for every query.

## Required Packages to Install

Below is a list of the main dependencies used in this project, along with a short explanation and the install command for each.

-  **`bcrypt`** – Secure password hashing and verification.

   ```bash
   npm install bcrypt
   ```

-  **`body-parser`** – Parses incoming request bodies (JSON / urlencoded).

   > Note: In many cases Express can replace this with `express.json()`, but this project uses `body-parser`.

   ```bash
    npm install body-parser
   ```

-  **`cookie-parser`** – Reads and parses cookies from incoming requests in Express.

   ```bash
   npm install cookie-parser
   ```

-  **`cors`** – CORS configuration (allowing the frontend origin, managing CORS headers, enabling credentials/cookies).

   ```bash
   npm install cors
   ```

-  **`csurf`** – CSRF protection middleware (prevents malicious cross-site requests).

   ```bash
   npm install csurf
   ```

-  **`dotenv`** – Loads environment variables from a `.env` file into `process.env`.

   ```bash
   npm install dotenv
   ```

-  **`express`** – Node.js web server framework for routing, API endpoints, and middleware handling.

   ```bash
   npm install express
   ```

-  **`express-mysql-session`** – MySQL-backed session store (persists sessions in the database).

   ```bash
   npm install express-mysql-session
   ```

-  **`express-session`** – Session management (stores logged-in state using a cookie + server-side session storage).

   ```bash
   npm install express-session
   ```

-  **`graphql`** – GraphQL core library (e.g., `buildSchema`, type definitions, GraphQL execution primitives).

   ```bash
   npm install graphql
   ```

-  **`graphql-http`** – HTTP handler for GraphQL in Express (provides `createHandler`).

   ```bash
   npm install graphql-http
   ```

-  **`mysql2`** – MySQL driver required by Sequelize for MySQL connections.

   ```bash
   npm install mysql2
   ```

-  **`nanoid`** – Generates short, collision-resistant unique IDs (e.g., `userId`, `gameId`).

   ```bash
   npm install nanoid
   ```

-  **`sequelize`** – ORM(Object–Relational Mapping) for relational databases (models, relations, queries, sync/migrations).

   ```bash
   npm install sequelize
   ```

## Project Structure

-  **controllers**: This folder contains the endpoint-related controller functions that are executed when incoming requests reach the server.

   -  `auth.controller.js`
   -  `game.controller.js`
   -  `session.controller.js`

-  **database**: This folder contains reusable functions that interact directly with the database (performing CRUD operations).

   -  `database.js`

-  **game**: This folder contains game-related functions and core gameplay logic.

   -  **levels**: A subfolder that contains the different AI difficulty level implementations:
      -  `easy.js`
      -  `hard.js`
      -  `medium.js`
      -  `very-easy.js`
   -  `game.js`
   -  `helper.function.js`

-  **graphql**: Contains GraphQL resolvers and schemas.

   -  `game.resolver.js`
   -  `game.schema.js`
   -  `user.resolver.js`
   -  `user.schema.js`

-  **routes**: Organizes the different API endpoints.

   -  `auth.route.js`
   -  `game.route.js`
   -  `graphql.route.js`

-  **validators**: Contains [middleware](https://expressjs.com/en/guide/using-middleware.html) functions that run **before** a request reaches its target endpoint/controller. Their job is to **validate incoming requests** (e.g., body fields, formats, required values) and then either:

   1. allow the request to continue in the middleware chain, or
   2. stop the request and return a validation error response to the client.

   -  `login.validator.js`
   -  `signup.validator.js`

-  `app.js`: The application's entry point.
