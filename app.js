import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import session from "express-session";
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

import Connection from "./models/database-connection.model.js"
import MySQLStoreImport from "express-mysql-session";
import auth from "./routes/auth.router.js"; 

const MySQLStore = MySQLStoreImport(session);


dotenv.config({path:'./environment/database.environment.env'})
console.log('IIIOO')
console.log(
process.env.DB_HOST,
process.env.DB_PORT,
process.env.DB_USER,
)
const sessionStore = new MySQLStore({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  createDatabaseTable: true,
  clearExpired: true,
  checkExpirationInterval: 1000* 60 *5
});

const app = express();

app.use(cors({
  origin : 'http://localhost:4200',
  credentials: true
}));

app.use(bodyParser.urlencoded({ extended: false }));

app.use(cookieParser()); 

app.use(session({
  key: 'tic-tac-toe_session',
  secret: 'secret-key',
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
    cookie: {
    maxAge: 1000*60 *60* 1
  }

}));

app.get("/", (req, res, next) => {

  res.writeHead(200, { "Content-Type": "text/html" });
  res.write(`
    <form action="/users/login" method="POST">
      <fieldset>
        <legend>Login</legend>
        
        <label for="username">Username:</label>
        <input type="text" id="username" name="username" required>
        <br><br>

        <label for="password">Password:</label>
        <input type="password" id="password" name="password" required>
        <br><br>

        <button type="submit">Login</button>
      </fieldset>
    </form>
  `);
  res.end();
});

app.use('/',(req,res,next)=>{

 req.session.something = 'almafa2'
 next()
})

app.use('/users', auth);

Connection.sync()
  .then(() => {
    console.log('DB synced');
    app.listen(3000, () => console.log('The server is running'));
  })
  .catch((error) => {
    console.log(error);
  });
