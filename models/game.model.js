import Connection from "./database-connection.model.js"
import { DataTypes } from "sequelize";

const Game = Connection.define('Game', {
    gameId:{
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        primaryKey: true,
        autoIncrement:true
    },

    step:{
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false
    },

    board: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: [[]] 
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
        type:DataTypes.INTEGER,
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