import Connection from "./database-connection.model.js"
import { DataTypes } from "sequelize";


const User = Connection.define('User', {
    userId:{
        type: DataTypes.STRING,
        allowNull:false,
        primaryKey:true,
        unique:true
    },

    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique:true
    },

    password: {
        type: DataTypes.STRING,
        allowNull: false
    },

    winNumber: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },

    loseNumber: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    }
});

export default User