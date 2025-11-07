/* 
{
    board: string[][],
    markup: 'x' | 'o',
    hardness: 'very-easy' | 'easy' | 'medium' | 'hard',
    // startRow?: number,
    // startColumn?: number,
    // endRow?: number,
    // endColumn?: number,
    lastMove?: { row: number, column: number },
}
*/

import helperFunctions from '../game/helper.function.js'


 const aiMoveController =(req, res, next)=>{

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

}

const checkWinner = (req, res, next) => {
    const { board } = req.body

    if (!board) {
        return next(new Error('Invalid request body'))
    }

    try {
        const winLength = helperFunctions.getWinLength(board)
        const result = helperFunctions.getWinner(board, null, winLength)

        return res.status(200).json({
            winner: result || null
        })

    } catch (error) {
        return next(error)
    }
}

export default {
    aiMoveController,
    checkWinner
}