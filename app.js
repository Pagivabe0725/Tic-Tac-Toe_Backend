import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import session from "express-session";
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import csrf  from 'csurf'

import Connection from "./models/database-connection.model.js"
import MySQLStoreImport from "express-mysql-session";
import auth from "./routes/auth.router.js"; 
import SessionController from "./controllers/session.controller.js";

dotenv.config({path:'./environment/database.environment.env'})
const MySQLStore = MySQLStoreImport(session);
const app = express();
const csrfProtection = csrf()
const HOUR =  1000 * 60 * 60;
const sessionStore = new MySQLStore({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  createDatabaseTable: true, 
  clearExpired: true,
  checkExpirationInterval: HOUR * 0.25
});

app.use(cors({
  origin : 'http://localhost:4200',
  credentials: true,
}));

app.use(bodyParser.json());

app.use(cookieParser()); 

app.use(session({
  key: 'tic-tac-toe_session',
  secret: 'secret-key',
  store: sessionStore,
  resave: false,
  rolling:false,
  saveUninitialized: false,
    cookie: {
    maxAge: HOUR * 48,
    httpOnly:true,
    secure:false,
    sameSite:'lax'
  }
}));

app.use(csrfProtection)

app.use(SessionController.logoutIfExpired)

app.get('/csrf-token', SessionController.heartBeat, (req, res) => {
  //console.log(req.session)
  res.json({ csrfToken: req.csrfToken()});

});

app.use('/users', auth);

app.use((error, req, res, next)=>{
  console.log(error)
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data });
})

Connection.sync()
  .then(() => {
    console.log('DB synced');
    app.listen(3000, () => console.log('The server is running'));
  })
  .catch((error) => {
    console.log(error);
  });
