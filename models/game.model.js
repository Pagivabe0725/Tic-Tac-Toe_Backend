import Connection from "./database-connection.model.js"
import { DataTypes } from "sequelize";

const Game = Connection.define('Game', {
    gameId:{
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        primaryKey: true,
    },

    board: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: [[]] 
    },

    lastMove: {
        type: DataTypes.JSON, 
        allowNull: true, 
        defaultValue: null 
    },

    status: {
        type: DataTypes.ENUM(
            'not_started',
            'in_progress',
            'won',
            'lost',
            'draw'
        ),
        defaultValue: 'not_started',
        allowNull: false
    },


    userId:{
        type:DataTypes.STRING,
        allowNull:false,
        references:{
            model:'Users',
            key:'userId'
        },
        onDelete: 'CASCADE',
        onUpdate:'CASCADE'
    }

 
})

export default Game