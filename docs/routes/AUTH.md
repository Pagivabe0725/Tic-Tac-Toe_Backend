# Auth route

This route file groups the application’s authentication and user-management endpoints.
In practice, everything related to **login**, **registration**, **session handling**, and **user data updates/validation** is handled here.

## What it does

-  **Session check:** `POST /check-session`  
   Verifies whether the user’s session is still valid. It also uses the **heartbeat** middleware to refresh the session expiration when needed.

-  **Login:** `POST /login`  
   Validates incoming credentials, refreshes the session, then authenticates the user.

-  **Signup:** `POST /signup`  
   Validates registration input, refreshes the session, and creates a new user account.

-  **Logout:** `POST /logout`  
   Logs out the current user (effectively clears the active session state).

-  **Email availability check:** `POST /is-used-email`  
   Returns whether the given email is already registered (useful before signup).

-  **Update user:** `PATCH /update-user`  
   Updates user profile data (e.g., email, win/lose statistics).

-  **Get user by identifier:** `POST /get-user-by-identifier`  
   Fetches a user based on a unique identifier (such as `userId` or email).

-  **Update password:** `POST /update-password`  
   Changes the user’s password (requires current password + new password + confirmation).

-  **Check password:** `POST /check-password`  
   Validates whether the provided password matches the stored one.

> Note: All endpoints listed above are prefixed with `/users`, since this route group is mounted under that path and filters requests related to authentication and user management.
