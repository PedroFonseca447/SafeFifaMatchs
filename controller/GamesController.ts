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
        
            
          const update = await gamesService.put(idGame, side, teamSelect, score, playerNickOne, playerNickTwo, dataMatch);
          
           
        
            return res.status(200).json(update);
        
          } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Erro no servidor, tente novamente' })
          }
    }





    async getAllGamesRegister (req: Request, res: Response){
         try {
    const all = await gamesService.getAllGamesRegister();
    res.status(200).json(all)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Erro no servidor, tente novamente' })
  }
    }


    async getStatsByNickName (req: Request<{ nickname: string }>, res: Response){

  try {
    const nickname = req.params.nickname;

    const  stats  = await gamesService.getStatsByNickName(nickname);
  
    return res.status(200).json({ stats });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Erro no servidor, tente novamente' });
  }
    }
}