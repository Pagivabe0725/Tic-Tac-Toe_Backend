//import { Sequelize } from "sequelize";

import User from "../models/user.model.js"
import Game from "../models/game.model.js";
import bcrypt from 'bcrypt'

const saltRounds = 12;


User.hasMany(Game, { foreignKey: 'userId' });
Game.belongsTo(User, { foreignKey: 'userId' });


async function isUsedEmail(email){
   
    if(typeof email !== 'string'){
        throw new Error('Parameter with bad type')
    }

    const actualUser = await User.findOne({where: {email: email}})
    return !!actualUser
}


async function isExistUser(userId){
    
    if(typeof userId !== 'number'){
        throw new Error('Parameter with bad type')
    }
    const actualUser = await User.findOne({where: {userId: userId}})
    return !!actualUser
}

async function userCreator(email , password){
    
    if(typeof email !== 'string' || typeof password !== 'string'){
        throw new Error('Parameters with bad type')
    }

    const emailUsed = await isUsedEmail(email);

    if(!emailUsed){
        const hashedPassword = await bcrypt.hash(password, saltRounds) 
        return User.create({email:email, password:hashedPassword })
    }
    else{
        throw new Error('This email is already used')
    }
}

async function authenticateUser(email, password){

     if(typeof email !== 'string' || typeof password !== 'string'){
        throw new Error('Parameters with bad type')
    }

    const actualUser = await  User.findOne({where:{email :email}})
    if(!actualUser){
        throw new Error('User does not exist!')
    }

    const doMatch = await bcrypt.compare(password, actualUser.password)

    if(doMatch){
        return actualUser
    }else{
        throw new Error('Invalid email or password')
    }
}

async function gameCreator(userId){
    
    if(typeof userId !== 'number'){
        throw new Error('Parameter with bad type');
    }

    const userExists = await isExistUser(userId);
    if(!userExists){
        throw new Error('User does not exist');
    }

    const newGame = await Game.create({
        userId: userId,
        step: 0,
    });

    return newGame;
}

export default {
    userCreator,
    gameCreator,
    authenticateUser,
}