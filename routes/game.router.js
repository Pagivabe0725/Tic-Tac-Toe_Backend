import express from 'express'
import gameController from '../controllers/game.controller.js'

const router = express.Router()

router.post('/ai-move', gameController.aiMoveController)

router.post('/check-board',gameController.checkWinner)

export default router