import { prisma } from '../lib/prisma'
import { getPlayerId } from './service'

export class PlayerService {
  async create(name: string) {
    if (!name) {
      const error: any = new Error('Bad request, o parametro foi passado de maneira errada')
      error.statusCode = 400
      throw error
    }

    let playerExist = await prisma.player.findUnique({
      where: { nickName: name },
    })

    if (playerExist) {
      const error: any = new Error(`esse nickname: ${name} já existe em nosso banco`)
      error.statusCode = 400
      throw error
    }

    const newPlayer = await prisma.player.create({
      data: {
        nickName: name,
      },
    })

    return newPlayer
  }

  async delete(playerId: string) {
    const user = prisma.player.findFirst({
      where: { id: playerId },
    })

    if (!user) {
      const error: any = new Error('Esse usuário não foi encontrado')
      error.statusCode = 400
      throw error
    }

    await prisma.player.delete({
      where: { id: playerId },
    })
  }

  async getNumPlayersWon(nickName: string) {
    const player = await prisma.player.findFirst({
      where: { nickName: nickName },
    })

    if (!player) {
      const error: any = new Error(` Esse jogador${player} não foi encontrado`)
      error.statusCode = 400
      throw error
    }

    const playerId = player.id

    const gamesWherePlayerWon = await prisma.game.findMany({
      where: {
        teams: {
          some: {
            resultTag: 'WINNER',
            OR: [{ playerOneId: playerId }, { playerTwoId: playerId }],
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
    })

    return gamesWherePlayerWon.length
  }


  async getIdPlayerNick(playerNick: string){
     const player = await getPlayerId(playerNick)

     if (!player) {
      const error: any = new Error(`esse nick não foi encontrado${playerNick}`)
      error.statusCode = 400
      throw error
    }
  }
}
