import express from "express";
import { createHandler } from "graphql-http/lib/use/express";
import userResolvers from "../qraphql/user.resolver.js";
import userSchema from "../qraphql/user.schema.js";
import gameSchema from "../qraphql/game.schema.js";
import gameResolvers from "../qraphql/game.resolver.js";

const router = express.Router();

router.use("/users", (req, res, next) => {
  if (!req.session) {
  }
  return createHandler({
    schema: userSchema,
    rootValue: userResolvers,
    context: () => ({ req, res }),
  })(req, res);
});


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
