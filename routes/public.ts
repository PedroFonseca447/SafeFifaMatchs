import express, { type Request, type Response } from 'express'
import { gamesController, playersController } from '../controller'



const router = express.Router()


/**
 * @swagger
 * tags:
 *   - name: Players
 *     description: Rotas relacionadas aos jogadores
 */



/**
 * @swagger
 * /players:
 *   post:
 *     summary: Cria um jogador
 *     tags: [Players]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Pedro"
 *     responses:
 *       201:
 *         description: succesfull
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "6312631263162316"
 *                 nickName:
 *                   type: string
 *                   example: "Jao"
 *       400:
 *         description: Bad request
 *         content: 
 *            application/json:
 *              schema:
 *                 type: object
 *                 properties:
 *                    message:
 *                       type: string
 *                       example: Algum dos parametros foi passado de maneira errada ou estão faltando
 *       409:
 *         description: Jogador já existente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Nick já existente"
 *       500:
 *         description: Erro interno no servidor
 */


router.post( // evite o usop de cadastroPlayers, o padrao ok para  APIRestful é utilizando
  '/players',
  playersController.create,
)


/**
 * @swagger
 * /players/{playerId}:
 *   delete:
 *     summary: Remove um usuário
 *     tags: [Players]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do usuário a ser removido
 *     responses:
 *       204:
 *         description: Usuário removido com sucesso
 *       404:
 *         description: Usuário não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Usuário não encontrado"
 *       500:
 *         description: Erro interno no servidor
 */


router.delete('/players/:playerId', playersController.delete)


/**
 * @swagger
 * /players/{nick}:
 *   get:
 *     summary: Get a player ID by nickname
 *     tags:
 *       - Players
 *     parameters:
 *       - in: path
 *         name: nick
 *         schema:
 *           type: string
 *         required: true
 *         description: Nickname of the player
 *     responses:
 *       200:
 *         description: Player ID found
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "69375bb0cb732e5a8af6f157"
 *       404:
 *         description: Object doesnt exist
 *       500:
 *         description: Internal server error
 */




router.get('/players/:nick', playersController.getIdPlayerbyNick)





/**
 * @swagger
 * tags:
 *   - name: Players 
 *     description: Rotas relacionadas aos jogadores
 *   - name: Games
 *     description: Rotas relacionadas às partidas
 */

/**
 * @swagger
 * /games:
 *   post:
 *     summary: Cria uma partida
 *     tags: [Games]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - dataMatch
 *               - teams
 *             properties:
 *               dataMatch:
 *                 type: string
 *                 example: "11/12/2025"
 *               teams:
 *                 type: array
 *                 minItems: 2
 *                 maxItems: 2
 *                 items:
 *                   type: object
 *                   required:
 *                     - side
 *                     - score
 *                     - resultTag
 *                     - teamSelect
 *                     - playerOneNickname
 *                   properties:
 *                     side:
 *                       type: string
 *                       enum: ["PROFIT", "VECTOR"]
 *                     score:
 *                       type: integer
 *                     resultTag:
 *                       type: string
 *                     teamSelect:
 *                       type: string
 *                     playerOneNickname:
 *                       type: string
 *                     playerTwoNickname:
 *                       type: string
 *                       nullable: true
 *                 example:
 *                   - side: "PROFIT"
 *                     score: 5
 *                     resultTag: "DRAW"
 *                     teamSelect: "Besiktas"
 *                     playerOneNickname: "Pedro"
 *                     playerTwoNickname: "João"
 *                   - side: "VECTOR"
 *                     score: 5
 *                     resultTag: "DRAW"
 *                     teamSelect: "Barcelona"
 *                     playerOneNickname: "gustavo"
 *                     playerTwoNickname: ""
 *     responses:
 *       201:
 *         description: Partida criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "game-id-999"
 *                 dataMatch:
 *                   type: string
 *                   example: "11/12/2025"
 *                 teams:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       side:
 *                         type: string
 *                       score:
 *                         type: integer
 *                       resultTag:
 *                         type: string
 *                       teamSelect:
 *                         type: string
 *                       playerOneId:
 *                         type: string
 *                       playerTwoId:
 *                         type: string
 *                         nullable: true
 *                   example:
 *                     - id: "team-id-123"
 *                       side: "PROFIT"
 *                       score: 8
 *                       resultTag: "WINNER"
 *                       teamSelect: "Besiktas"
 *                       playerOneId: "player-id-001"
 *                       playerTwoId: "player-id-002"
 *
 *                     - id: "team-id-456"
 *                       side: "VECTOR"
 *                       score: 5
 *                       resultTag: "LOSS"
 *                       teamSelect: "Barcelona"
 *                       playerOneId: "player-id-010"
 *                       playerTwoId: null
 *       404:
 *         description: Jogador não encontrado ou IDs repetidos na partida
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Um dos jogadores não foi encontrado no registro para ser liberado"
 *       500:
 *         description: Erro interno no servidor
 */



router.post('/games', gamesController.post);



/**
 * @swagger
 * /games/{gameId}:
 *   delete:
 *     summary: Remove uma partida
 *     tags: [Games]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da partida a ser removido
 *     responses:
 *       204:
 *         description: Partida removida com sucesso
 *       404:
 *         description: Partida não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Partida não encontrada"
 *       500:
 *         description: Erro interno no servidor
 */



router.delete('games/:gameId', gamesController.delete);




router.put('/games/:gameId/:side', gamesController.put);


/**
 * @swagger
 * /games:
 *   get:
 *     summary: Recebe todas partidas registradas
 *     tags: [Games]
 *     responses:
 *       200:
 *         description: Todas partidas registradas
 *       500:
 *         description: Erro de API ou banco vazio
 */


router.get('/games', gamesController.getAllGamesRegister)

/**
 * @swagger
 * /players/{id}:
 *   put:
 *     summary: Atualiza o nickname de um jogador
 *     tags: [Players]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do jogador
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newNickname
 *             properties:
 *               newNickname:
 *                 type: string
 *                 example: "NovoNick"
 *     responses:
 *       200:
 *         description: Jogador atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Usuário alterado com sucesso"
 *       400:
 *         description: Nickname inválido
 *       404:
 *         description: Jogador não encontrado
 *       409:
 *         description: Nickname já existente
 *       500:
 *         description: Erro interno no servidor
 */


router.put('/players/:id', playersController.put );



/**
 * @swagger
 * /players/{nickname}/games:
 *   get:
 *     summary: Get how much games this player had win
 *     tags:
 *       - Players
 *     parameters:
 *       - in: path
 *         name: nickname
 *         schema:
 *           type: string
 *         required: true
 *         description: Nickname of the player you want to consult
 *     responses:
 *       200:
 *         description: Number of matches this player had won
 *         content:
 *           application/json:
 *             schema:
 *               type: number
 *               example: 8
 *       404:
 *         description: Player not found
 *       500:
 *         description: Internal server error
 */




router.get('/players/:nickname/games', playersController.get);



/**
 * @swagger
 * /games/{nickname}/stats:
 *   get:
 *     summary: Retorna estatísticas do jogador (wins/loss/draw)
 *     tags: [Games]
 *     parameters:
 *       - in: path
 *         name: nickname
 *         required: true
 *         schema:
 *           type: string
 *         description: Nickname do jogador
 *     responses:
 *       200:
 *         description: Estatísticas do jogador
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 stats:
 *                   type: object
 *                   properties:
 *                     wins:
 *                       type: integer
 *                       example: 7
 *                     loss:
 *                       type: integer
 *                       example: 5
 *                     draw:
 *                       type: integer
 *                       example: 2
 *             example:
 *               stats:
 *                 wins: 7
 *                 loss: 5
 *                 draw: 2
 *       404:
 *         description: Player not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Player 'pedro' não encontrado"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Erro no servidor, tente novamente"
 */





router.get('/games/:nickname/stats', gamesController.getStatsByNickName);







export default router;
