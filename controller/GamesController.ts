import { type Request, type Response } from 'express'
import { prisma } from '../lib/prisma'
import { getPlayerId } from '../services/service'
import type { TeamSide } from '@prisma/client';
import { gamesService } from '../services';

export class GamesController {


    async post(req: Request, res: Response){
        try {
            const { dataMatch, teams } = req.body;

          const game = await gamesService.post(dataMatch, teams);
        
            return res.status(201).json(game);
          } catch (error) {
            return res
              .status(500)
              .json({ message: 'Erro no servidor, tente novamente' });
          }
    }


    async delete(req: Request<{gameID: string}>, res: Response){
        try{

    const {gameId} = req.body;


     const gameD = gamesService.delete(gameId);


    return res.status(204).send(gameD);


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