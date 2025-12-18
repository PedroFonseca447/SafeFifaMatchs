import { type Request, type Response } from 'express'
import { prisma } from '../lib/prisma'
import { getPlayerId } from '../services/service'
import type { TeamSide } from '@prisma/client';

export class GamesController {


    async post(req: Request, res: Response){
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
    }


    async delete(req: Request<{gameID: string}>, res: Response){
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
    }


    async put (req: Request<{ gameId: string, side: string }>, res: Response){
        try {
            const idGame = req.params.gameId as string;
        
            const side = req.params.side as TeamSide;
        
            const { teamSelect, score, playerNickOne, playerNickTwo, dataMatch } = req.body;
        
            
        
           if (dataMatch !== "") {
              const updateDayMatch = await prisma.game.update({
                where: { id: idGame },
                data: {
                  dataMatch: dataMatch,
                },
              });
              res.status(201).json(updateDayMatch)
              }
        
        
        
        
            
        
            const teamGame = await prisma.teamInGame.findFirst({
              where: { gameId: idGame , side: side }
            });
        
            const data: Record<string, any> = {};
        
            if (!teamGame) {
              res.status(404).json({ message: 'Id de game não identificado' })
              return;
            }
        
            
           if( teamSelect !==""){
              data.teamSelect = teamSelect;
           }    
        
            if( score !== "" ){
              data.score = score;
           }    
        
            if( playerNickOne !== "" ){
        
                const playerIdOneExist = await prisma.player.findFirst({
                  where: {nickName: playerNickOne}
                })  
        
                if(!playerIdOneExist){
                  res.status(404).json({ message: `Esse nick nao foi encontrado ${playerNickOne} ` })
                  return;
                }
        
                if(playerIdOneExist.id !== teamGame.playerOneId){
                    data.playerOneId = playerIdOneExist.id;
                }
            }    
        
        
            if(playerNickTwo !== ""){
        
                const playerTwoExist = await prisma.player.findFirst({
                  where: {nickName: playerNickTwo}
                })  
        
                if(!playerTwoExist){
                  res.status(404).json({ message: `Esse nick nao foi encontrado ${playerNickTwo} ` })
                  return;
                }
        
                if(playerTwoExist.id !== teamGame.playerTwoId){
                    data.playerTwoId = playerTwoExist.id;
                }
            }   
            
        
           
        
            const update = await prisma.teamInGame.update({
                where: {
                  gameId_side: {
                    gameId: idGame,
                    side,
                  },
                },
                data,
            })
          
           
        
            return res.status(200).json(update);
        
          } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Erro no servidor, tente novamente' })
          }
    }





    async getAllGamesRegister (req: Request, res: Response){
         try {
    const all = await prisma.game.findMany()
    res.status(200).json(all)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Erro no servidor, tente novamente' })
  }
    }


    async getStatsByNickName (req: Request<{ nickname: string }>, res: Response){
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
    }
}