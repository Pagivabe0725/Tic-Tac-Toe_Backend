
import DATABASE from '../database/database.js'



const singUp = async (req, res, next) => {
   
    const body = req.body;
    let newUser
    if(body.username && body.password){
        try {
            newUser = await DATABASE.userCreator(body.username, body.password);
            res.status(201).json({ message: 'User created', userId: newUser.id });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    } else {
        res.status(400).json({ error: 'Username and password are required' });
    }
    res.end()
}


const login = async (req, res , next)=>{

    const body = req.body
    if(body.username && body.password){
        
        try {
            const resultUser = await DATABASE.authenticateUser(body.username, body.password)
            res.status(201).json(resultUser)
        }catch(error){
           res.status(400).json({ error: error.message });
        }
    }
}
 
export default {
    singUp,
    login
}