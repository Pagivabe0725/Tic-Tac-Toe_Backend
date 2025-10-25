import { Sequelize } from "sequelize";

const sequelize = new Sequelize(
  'tic-tac-toe',
  'root',
  'Password12345',
  {
    host: 'localhost',
    dialect: 'mysql'
  }
);

export default sequelize
