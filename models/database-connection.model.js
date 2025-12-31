import { Sequelize } from "sequelize";
import dotenv from "dotenv";

// Load database-related environment variables from a dedicated .env file.
// This allows keeping DB credentials/config out of the codebase.
dotenv.config({ path: "./environment/database.environment.env" });

// Create a Sequelize instance (DB connection + ORM configuration).
// Connection details are provided via environment variables.
const sequelize = new Sequelize(
   process.env.DB_NAME, // Database name
   process.env.DB_USER, // Database username
   process.env.DB_PASSWORD, // Database password
   {
      host: process.env.DB_HOST, // Database host (e.g. localhost, container name, remote host)
      dialect: "mysql", // SQL dialect used by Sequelize for this project
   }
);

// Export the configured Sequelize instance so it can be reused across the app
// (models, migrations, sync, connection testing, etc.).
export default sequelize;
