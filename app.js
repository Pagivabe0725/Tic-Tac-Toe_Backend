import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import session from "express-session";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import csrf from "csurf";

import Connection from "./models/database-connection.model.js";
import MySQLStoreImport from "express-mysql-session";
import auth from "./routes/auth.router.js";
import game from "./routes/game.router.js";
import SessionController from "./controllers/session.controller.js";
import graphqlRouter from "./routes/graphql.router.js";

// Load database-related environment variables (host/user/password/db name, etc.)
dotenv.config({ path: "./environment/database.environment.env" });

// Initialize MySQL session store factory using express-session
const MySQLStore = MySQLStoreImport(session);

// Create the Express application instance
const app = express();

// CSRF middleware instance (protects against cross-site request forgery)
const csrfProtection = csrf();

// Common time constant used for session expiration configuration
const HOUR = 1000 * 60 * 60;

// Create a persistent session store in MySQL
// This allows sessions to survive server restarts and be shared across instances.
const sessionStore = new MySQLStore({
   host: process.env.DB_HOST,
   port: parseInt(process.env.DB_PORT), // MySQL port from env (string -> number)
   user: process.env.DB_USER,
   password: process.env.DB_PASSWORD,
   database: process.env.DB_NAME,

   // Automatically create the session table if it doesn't exist
   createDatabaseTable: true,

   // Periodically remove expired session rows
   clearExpired: true,

   // How often to check for expired sessions (here: every 15 minutes)
   checkExpirationInterval: HOUR * 0.25,
});

// --- CORS configuration ---
// Allows the Angular frontend (localhost:4200) to call this API and include cookies.
app.use(
   cors({
      origin: "http://localhost:4200",
      credentials: true,
   })
);

// --- Request body parsing ---
// Parse incoming JSON requests into req.body
app.use(bodyParser.json());

// --- Cookie parsing ---
// Needed for session + CSRF handling (cookies are read from request headers)
app.use(cookieParser());

// --- Session configuration ---
// Stores session data in MySQL and sets a cookie on the client to identify the session.
app.use(
   session({
      key: "tic-tac-toe_session", // Cookie name
      secret: "secret-key", // Used to sign the session ID cookie (should come from env in production)
      store: sessionStore, // Persist sessions in MySQL
      resave: false, // Don't force-save session when not modified
      rolling: false, // Don't reset maxAge on every response unless you explicitly want "sliding sessions"
      saveUninitialized: false, // Don't create sessions until something is stored
      cookie: {
         maxAge: HOUR * 48, // Session cookie lifetime (48 hours)
         httpOnly: true, // Prevent JS access to the cookie
         secure: false, // Must be true when using HTTPS in production
         sameSite: "lax", // Helps mitigate CSRF while allowing normal navigation
      },
   })
);

// --- GraphQL endpoint ---
// Mounted before CSRF so the router can decide how it handles CSRF (depending on implementation).
app.use("/graphql", graphqlRouter);

// --- CSRF protection ---
// After this middleware, unsafe requests (POST/PUT/DELETE, etc.) require a valid CSRF token.
app.use(csrfProtection);

// --- Session lifecycle handling ---
// Custom middleware to invalidate/logout sessions that are considered expired by app logic.
app.use(SessionController.logoutIfExpired);

// --- CSRF token bootstrap endpoint ---
// Frontend can call this to obtain a CSRF token and use it in subsequent state-changing requests.
// HeartBeat can be used to keep the session alive and/or validate session state.
app.get("/csrf-token", SessionController.heartBeat, (req, res) => {
   res.json({ csrfToken: req.csrfToken() });
});

// --- REST routes ---
// Auth-related endpoints (register/login/logout/etc.)
app.use("/users", auth);

// Game-related endpoints (moves, save/load, stats, etc.)
app.use("/game", game);

// --- Global error handler ---
// Normalizes error responses and prevents Express from crashing on thrown/rejected errors.
app.use((error, req, res, next) => {
   console.log(error);
   const status = error.statusCode || 500;
   const message = error.message;
   const data = error.data;
   res.status(status).json({ message: message, data: data });
});

// --- Database sync + server start ---
// Sync Sequelize models to the database, then start listening once DB is ready.
Connection.sync()
   .then(() => {
      console.log("DB synced");
      app.listen(3000, () => console.log("The server is running"));
   })
   .catch((error) => {
      console.log(error);
   });
