import express from "express";
import { createHandler } from "graphql-http/lib/use/express";
import userResolvers from "../qraphql/user.resolver.js";
import userSchema from "../qraphql/user.schema.js";
import gameSchema from "../qraphql/game.schema.js";
import gameResolvers from "../qraphql/game.resolver.js";

/**
 * Express router that exposes GraphQL endpoints for users and game operations.
 * Each route uses `graphql-http`'s `createHandler` to serve a GraphQL schema
 * with the appropriate resolvers and injects the express `req` and `res`
 * into the GraphQL context.
 *
 * @module routes/graphql.router
 */
const router = express.Router();

/**
 * GraphQL endpoint for user-related operations.
 * Mount path: `/users`
 *
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware
 */
router.use("/users", (req, res, next) => {
  if (!req.session) {
  }
  return createHandler({
    schema: userSchema,
    rootValue: userResolvers,
    context: () => ({ req, res }),
  })(req, res);
});

/**
 * GraphQL endpoint for game-related operations.
 * Mount path: `/game`
 *
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware
 */
router.use("/game", (req, res, next) => {
  if (!req.session) {
  }
  return createHandler({
    schema: gameSchema,
    rootValue: gameResolvers,
    context: () => ({ req, res }),
  })(req, res);
});

export default router;
