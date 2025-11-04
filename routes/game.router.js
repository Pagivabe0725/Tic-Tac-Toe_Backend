import express from 'express'
import aiMove from '../game/game.js'


const router = express.Router()

router.post('/ai-move', (req, res, next)=>{

    console.log('Bennevan')
    const {board, lastMove, markup, hardness} = req.body
    let result 
    try {

        result = aiMove(board,markup,hardness,lastMove || null )
        console.log(result)
        res.status(200).send(result)
    }
    catch(error){
        next(error)
    }

})

export default router