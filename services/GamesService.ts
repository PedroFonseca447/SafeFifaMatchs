import type { TeamSide } from '@prisma/client'
import { prisma } from '../lib/prisma'
import { getPlayerId } from './service'

export class GamesService {
  async post(dataMatch: any, teams: any) {
    if (!Array.isArray(teams) || teams.length !== 2) {
      const error: any = new Error('Não é permitido salvar apenas um time por partida.')
      error.statusCode = 400
      throw error
    }

    const resolvedTeams: any[] = []

    for (const t of teams) {
      const playerOneId = await getPlayerId(t.playerOneNickname)
      const playerTwoId = await getPlayerId(t.playerTwoNickname)

      if (!playerOneId) {
        const error: any = new Error('O nick de player não foi reconhecido.')
        error.statusCode = 400
        throw error
      }

      if (playerOneId === playerTwoId) {
        const error: any = new Error('O nick de player é o mesmo nos 2 jogadores, não é permitido.')
        error.statusCode = 400
        throw error
      }

      resolvedTeams.push({
        side: t.side,
        score: t.score,
        resultTag: t.resultTag,
        teamSelect: t.teamSelect,
        playerOneId,
        playerTwoId,
      })
    }

    return prisma.game.create({
      data: {
        dataMatch,
        teams: { create: resolvedTeams },
      },
      include: { teams: true },
    })
  }

  async delete(gameId: string) {
    const game = prisma.game.findFirst({
      where: { id: gameId },
    })

    if (!game) {
      const error: any = new Error(' O id de game que foi passado não existe')
      error.statusCode = 400
      throw error
    }

    return await prisma.game.delete({
      where: { id: gameId },
    })
  }

  async put(
    gameId: string,
    side: TeamSide,
    teamSelect?: string,
    score?: number,
    playerNickOne?: string,
    playerNickTwo?: string,
    dataMatch?: string,
  ) {
   
    if (dataMatch && dataMatch.trim() !== '') {
      await prisma.game.update({
        where: { id: gameId },
        data: { dataMatch },
      })
    }

    const teamGame = await prisma.teamInGame.findFirst({
      where: { gameId, side },
    })

    if (!teamGame) {
      const error: any = new Error(
        'O id de game que foi passado não existe (ou side não encontrado)',
      )
      error.statusCode = 400
      throw error
    }

    const data: Record<string, any> = {}

    if (teamSelect && teamSelect.trim() !== '') {
      data.teamSelect = teamSelect
    }

   
    if (typeof score === 'number') {
      data.score = score
    }

    if (playerNickOne && playerNickOne.trim() !== '') {
      const playerOne = await prisma.player.findFirst({
        where: { nickName: playerNickOne },
      })

      if (!playerOne) {
        const error: any = new Error(`Nick não encontrado: ${playerNickOne}`)
        error.statusCode = 404
        throw error
      }

      if (playerOne.id !== teamGame.playerOneId) {
        data.playerOneId = playerOne.id
      }
    }

    if (playerNickTwo && playerNickTwo.trim() !== '') {
      const playerTwo = await prisma.player.findFirst({
        where: { nickName: playerNickTwo },
      })

      if (!playerTwo) {
        const error: any = new Error(`Nick não encontrado: ${playerNickTwo}`)
        error.statusCode = 404
        throw error
      }

      if (playerTwo.id !== teamGame.playerTwoId) {
        data.playerTwoId = playerTwo.id
      }
    }

 
    return prisma.teamInGame.update({
      where: {
        gameId_side: {
          gameId,
          side,
        },
      },
      data,
    })
  }
}
