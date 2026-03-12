# Game route

This route file groups all backend endpoints related to the **game domain**.
It covers everything from **saved game CRUD operations** (create, fetch, list, update, delete)
to **gameplay logic endpoints** such as AI move calculation and board evaluation.

## What it does

-  **Fetch a single game:** `POST /get`  
   Retrieves a specific saved game by `gameId`.

-  **List games for a user (pagination + ordering):** `POST /get-all`  
   Returns a paginated list of games that belong to a given `userId`.  
   Supports paging (`page`) and sorting (`ASC` / `DESC`), and returns:

   -  `rows` (the current page of games)
   -  `count` (total number of saved games)

-  **Update a game:** `PATCH /update-game`  
   Partially updates an existing game. Any of these fields can be changed:

   -  `board`
   -  `lastMove`
   -  `status`

-  **Delete a game:** `POST /delete-game`  
   Deletes a saved game using `userId` + `gameId`.

-  **AI move calculation:** `POST /ai-move`  
   The client sends the current board state, the AI/player symbol (`markup`), the difficulty (`hardness`),
   and optionally the last move. The backend responds with:

   -  the updated board (after the AI move)
   -  the AI move coordinates
   -  the evaluated winner state (`x`, `o`, `draw`, or `null`)

-  **Board evaluation (winner check):** `POST /check-board`  
   Checks whether the current board has a winner or results in a draw.

-  **Create a new game:** `POST /create-game`  
   Creates and stores a new game for a user (name, board, status, difficulty, opponent type, size, etc.).

> Note: All endpoints listed above are prefixed with `/game`, since this route group is mounted under that path and filters requests related to gameplay and game management.
