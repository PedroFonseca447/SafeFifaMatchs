import { type Request, type Response } from 'express'
import { prisma } from '../lib/prisma'
import { getPlayerId } from '../services/service'
import { playerService } from '../services'

export class PlayersController {
  async create(req: Request, res: Response) {
    try {
      const { name } = req.body

      const newPlayer = await playerService.create(name)

      res.status(201).json(newPlayer)
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Erro no servidor, tente novamenyte' })
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { playerId } = req.body

      await playerService.delete(playerId)

      return res.status(204).send()
    } catch (error) {
      return res.status(500).json({ message: 'Erro interno no servidor' })
    }
  }

  async put(req: Request<{ id: string }>, res: Response) {
    try {
      const idPlayer = req.params.id
      const { newNickname } = req.body

      if (!newNickname || newNickname.trim() === '') {
        res.status(400).json({ message: 'Nickname inválido' })
        return
      }

      const player = await prisma.player.findFirst({
        where: { id: idPlayer },
      })

      if (!player) {
        res.status(404).json({ message: 'Id de usuário não identificado' })
        return
      }

      const existsNick = await prisma.player.findFirst({
        where: {
          nickName: newNickname,
          NOT: {
            id: idPlayer, // importante ja que nickname é unique no prisma
          },
        },
      })

      if (existsNick) {
        res.status(409).json({ message: 'Já existe um usuário com esse nickname' })
        return
      }

      await prisma.player.update({
        where: { id: idPlayer },
        data: {
          nickName: newNickname,
        },
      })

      res.status(200).json({ message: 'usuário alterado com sucesso' })
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Erro no servidor, tente novamente' })
    }
  }

  async get(req: Request<{ nickname: string }>, res: Response) {
    try {
      const nickname = req.params.nickname

      const numbPlayersWin = await playerService.getNumPlayersWon(nickname)

      return res.status(200).json({
        totalWins: numbPlayersWin,
      })
    } catch (error) {
      console.error(error)
      return res.status(500).json({
        message: 'Erro no servidor',
      })
    }
  }

  async getIdPlayerbyNick(req: Request<{ nick: string }>, res: Response) {
    try {
      const playerNick = req.params.nick 
      const player = await playerService.getIdPlayerNick(playerNick);


      res.status(200).json(player)
    } catch (error) {
      res.status(500).json({ message: 'Erro no servidor, tente novamente' })
    }
  }
}
