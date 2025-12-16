import express, { type Request, type Response } from 'express'
import { prisma } from '../lib/prisma'
import { getPlayerId } from '../services/service'
import type { TeamSide } from '@prisma/client'



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
  async (req: Request, res: Response) => {
    try {
      const { name} = req.body;

      if(!name){
        return res.status(404).json('Bad request, o parametro foi passado de maneira errada');
      }

       let playerExist = await prisma.player.findUnique({
        where: { nickName: name },
      });

      if(playerExist){
          
       return res.status(409).json(`esse nickname: ${name} já existe em nosso banco`);
        
      }


     const newPlayer = await prisma.player.create({
      data: {
        nickName: name,
      },
 
    });

      res.status(201).json(newPlayer)
    } catch (error) {
      console.error(error)
      res
        .status(500)
        .json({ message: 'Erro no servidor, tente novamenyte' })
    }
  },
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


router.delete('/players/:playerId', async (req: Request<{playerId: string}>, res: Response) => {
  try{

    const {playerId} = req.body;

    const user = prisma.player.findFirst({
      where: {id: playerId},
    })


    if(!user){
      res.status(404).json({ message: "Esse usuário não foi encontrado"})
    }


    await prisma.player.delete({
      where: {id: playerId}
    })

    return res.status(204).send();


  }catch(error){

     return res.status(500).json({ message: 'Erro interno no servidor' });
  }
})


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




router.get('/players/:nick', async (req: Request<{ nick: string }>, res: Response) => {
  try {

    const playerNick = req.params.nick ;
      const player = await getPlayerId(playerNick); 

      if(!player){
        return res.status(404).json(`esse nick não foi encontrado${playerNick}`);
      }
    res.status(200).json(player)
  } catch (error) {
    res.status(500).json({ message: 'Erro no servidor, tente novamente' })
  }
})





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



router.post('/games', async (req: Request, res: Response) => {
  try {
    const { dataMatch, teams } = req.body;


    if (!Array.isArray(teams) || teams.length !== 2) {
      return res.status(400).json({
        message: 'A partida deve conter exatamente 2 times.',
      });
    }


    const resolvedTeams: any[] = [];

    for (const t of teams) {
      const playerOneId = await getPlayerId(t.playerOneNickname);
      const playerTwoId = await getPlayerId(t.playerTwoNickname);

      if (!playerOneId) {
        return res.status(404).json({
          message: `Jogador principal (playerOne) não encontrado para o time ${t.teamSelect}.`,
        });
      }

     
      if (playerOneId && playerTwoId && playerOneId === playerTwoId) {
        return res.status(400).json({
          message: `playerOne e playerTwo são o mesmo jogador no time ${t.teamSelect}.`,
        });
      }

    //protecao no futuro para casos de empate e tags erradas   

      // const profitScore = teams.find(t => t.side === "PROFIT")?.score;
      // const vectorScore = teams.find(t => t.side === "VECTOR")?.score;

      // // if(profitScore === vectorScore){
      // //       const profitResult = teams.find(t => t.resultTag === "PROFIT")?.resultTag;
      // // } 

      
      resolvedTeams.push({
        side: t.side,
        score: t.score,
        resultTag: t.resultTag,
        teamSelect: t.teamSelect,
        playerOneId,
        playerTwoId,
      });
    }

    const game = await prisma.game.create({
      data: {
        dataMatch,
        teams: { create: resolvedTeams },
      },
      include: { teams: true },
    });

    return res.status(201).json(game);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: 'Erro no servidor, tente novamente' });
  }
});



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



router.delete('games/:gameId', async( req: Request<{gameID: string}>,res: Response) => {

  try{

    const {gameId} = req.body;

    const game = prisma.game.findFirst({
      where: {id: gameId}
    })

      if(!game){
      res.status(404).json({ message: "Essa partida não foi encontrada"})
    }


    await prisma.player.delete({
      where: {id: gameId}
    })

    return res.status(204).send();


  }catch(error){
    return res.status(500).json({ message: 'Erro interno no servidor' });
  }


})


router.put('/games/:id/:side', async (req: Request<{ gameId: string, side: string }>, res: Response) => {
  try {
    const idGame = req.params.gameId;
    const side = req.params.side as TeamSide;

    const { teamSelect, score, playerNick } = req.body;
 

    const game = await prisma.teamInGame.findFirst({
      where: { gameId: idGame , side: side }
    });

    if (!game) {
      res.status(404).json({ message: 'Id de game não identificado' })
      return;
    }

    
   
    

    

    //pega o id da partida e depois o id do time, analisar como passar mais de um
    //_id por time, ai com isso eu edito o time que eu quero dentro da partida que eu 
    //apontei

    //game id-> teamInGame(gameID) -> _id do time, assim eu edito 


   

    res.status(200).json({ message: 'usuário alterado com sucesso' })

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro no servidor, tente novamente' })
  }
});


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


router.get('/games', async (req: Request, res: Response) => {
  try {
    const all = await prisma.game.findMany()
    res.status(200).json(all)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Erro no servidor, tente novamente' })
  }
})

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


router.put('/players/:id', async (req: Request<{ id: string }>, res: Response) => {
  try {
    const idPlayer = req.params.id;
    const { newNickname } = req.body;

    if (!newNickname || newNickname.trim() === '') {
      res.status(400).json({ message: 'Nickname inválido' })
      return;
    }

    const player = await prisma.player.findFirst({
      where: { id: idPlayer }
    });

    if (!player) {
      res.status(404).json({ message: 'Id de usuário não identificado' })
      return;
    }


    const existsNick = await prisma.player.findFirst({
      where: {
        nickName: newNickname,
        NOT: {
          id: idPlayer // importante ja que nickname é unique no prisma
        }
      }
    });

    if (existsNick) {
      res.status(409).json({ message: 'Já existe um usuário com esse nickname' })
      return;
    }

    await prisma.player.update({
      where: { id: idPlayer },
      data: {
        nickName: newNickname
      }
    });

    res.status(200).json({ message: 'usuário alterado com sucesso' })

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro no servidor, tente novamente' })
  }
});



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




router.get('/players/:nickname/games', async (req, res) => {//colection/item/colection seguindo o padrao
  try {
    const nickname = req.params.nickname;

    const player = await prisma.player.findFirst({
      where: { nickName: nickname }, 
    });

    if (!player) {
      return res.status(404).json({
        message: `Player '${nickname}' não encontrado`
      });
    }

    const playerId = player.id;

   
    const gamesWherePlayerWon = await prisma.game.findMany({
      where: {
        teams: {
          some: {
            resultTag: 'WINNER', 
            OR: [
              { playerOneId: playerId },
              { playerTwoId: playerId },
            ],
          },
        },
      },
      include: {
        teams: {
          include: {
            playerOne: true,
            playerTwo: true,
          },
        },
      },
    });

    

    return res.status(200).json({
      totalWins: gamesWherePlayerWon.length,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: 'Erro no servidor',
    });
  }
});



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





router.get('/games/:nickname/stats', async (req: Request<{ nickname: string }>, res: Response) => {
  const stats = { wins: 0, loss: 0, draw: 0 };

  try {
    const nickname = req.params.nickname;

    const player = await prisma.player.findFirst({
      where: { nickName: nickname },
    });

    if (!player) {
      return res.status(404).json({ message: `Player '${nickname}' não encontrado` });
    }

    const playerId = player.id;

    const allPlayerGames = await prisma.game.findMany({
      where: {
        teams: {
          some: {
            OR: [{ playerOneId: playerId }, { playerTwoId: playerId }],
          },
        },
      },
      select: {
        id: true,
        teams: {
          where: {
            OR: [{ playerOneId: playerId }, { playerTwoId: playerId }],
          },
          select: {
            resultTag: true,
            playerOneId: true,
            playerTwoId: true,
          },
        },
      },
    });

    for (const g of allPlayerGames) {
      const myTeam = g.teams.find(t => t.playerOneId === playerId || t.playerTwoId === playerId);
      const result = myTeam?.resultTag;

      if (result === 'WINNER') {
        stats.wins++;
      } 
      else if (result === 'LOSS') {
        stats.loss++;
      } 
      else if (result === 'DRAW') {
          stats.draw++;
      } 
    }

    return res.status(200).json({ stats });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Erro no servidor, tente novamente' });
  }
});







export default router;
