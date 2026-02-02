import type { TeamSide } from '@prisma/client'
import { prisma } from '../lib/prisma'
import { getPlayerId, getTeamChoiceId } from './service'
import { teamsChoiceService } from '.'

type ResultTag = 'WINNER' | 'LOSS' | 'DRAW'
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

      if (!playerOneId || !playerTwoId) {
        const error: any = new Error('O nick de player não foi reconhecido.')
        error.statusCode = 400
        throw error
      }

      if (playerOneId === playerTwoId) {
        const error: any = new Error('O nick de player é o mesmo nos 2 jogadores, não é permitido.')
        error.statusCode = 400
        throw error
      }

      const score = Number(t.score ?? 0)

      const resultInc =
        t.resultTag === 'WINNER'
          ? { numWins: { increment: 1 } }
          : t.resultTag === 'LOSS'
            ? { numLoss: { increment: 1 } }
            : { numDraw: { increment: 1 } }

      await prisma.player.update({
        where: { id: playerOneId },
        data: { numScoreGoals: { increment: score }, ...resultInc },
      })

      await prisma.player.update({
        where: { id: playerTwoId },
        data: { numScoreGoals: { increment: score }, ...resultInc },
      })


      const teamChoiceName = String(t.teamChoiceName ?? t.teamSelect ?? '').trim()
      if (!teamChoiceName) {
        const error: any = new Error('Nome do time selecionado é obrigatório.')
        error.statusCode = 400
        throw error
      }

      const teamChoice = await prisma.teamsChoice.upsert({
        where: { nome: teamChoiceName },
        update: {
          nChoices: { increment: 1 },
        },
        create: {
          nome: teamChoiceName,
          stars: Number(t.teamChoiceStars ?? 0),
          nChoices: 1,
        },
        select: { id: true },
      })

      resolvedTeams.push({
        side: t.side,
        score,
        resultTag: t.resultTag,
        teamSelect: teamChoiceName,     
        teamChoiceId: teamChoice.id,    
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

  async getAllGamesRegister() {
    const games = await prisma.game.findMany({
      include: {
        teams: {
          include: {
            teamChoice: {select: {nome: true}},
            playerOne: { select: { id: true, nickName: true } },
            playerTwo: { select: { id: true, nickName: true } },
          },
        },
      },
    })

    return games.map((g) => {
      const profit = g.teams.find((t) => t.side === 'PROFIT') ?? null //dados da equipe profit
      const vector = g.teams.find((t) => t.side === 'VECTOR') ?? null

      return {
        id: g.id,
        dataMatch: g.dataMatch,

        profit: profit
          ? {
              teamSelect: profit.teamSelect,
              score: profit.score,
              resultTag: profit.resultTag,
              teamChoiceName: profit.teamChoice?.nome ?? null,
              playerOne: profit.playerOne?.nickName ?? null,
              playerTwo: profit.playerTwo?.nickName ?? null,
            }
          : null,

        vector: vector
          ? {
              teamSelect: vector.teamSelect,
              score: vector.score,
              resultTag: vector.resultTag,
              teamChoiceName: vector.teamChoice?.nome ?? null,
              playerOne: vector.playerOne?.nickName ?? null,
              playerTwo: vector.playerTwo?.nickName ?? null,
            }
          : null,
      }
    })
  }

  async getGameByNickname(nickName: string) {
    if (nickName === 'all') {
      // retorna todos os jogos
      return await this.getAllGamesRegister()
    }

    const player = await prisma.player.findFirst({
      where: { nickName: nickName },
    })

    if (!player) {
      const error: any = new Error(` Esse jogador${player} não foi encontrado`)
      error.statusCode = 400
      throw error
    }

    const playerId = player.id

    const games = await prisma.game.findMany({
      where: {
        teams: {
          some: {
            OR: [{ playerOneId: playerId }, { playerTwoId: playerId }], // aqui eu filrei na tablea
            //games apenas o que era de meu interesse, ou seja, jogos que o player participou
          },
        },
      },
      include: {
        teams: {
          include: {
            playerOne: { select: { id: true, nickName: true } },
            playerTwo: { select: { id: true, nickName: true } },
          },
        },
      },
    })
    //o include vai trazer os dados relacionados daquela tabela
    // que nao estao no objeto principal de jogos ( data e id , ou seja o que tem em teams)

    return games.map((g) => {
      const profit = g.teams.find((t) => t.side === 'PROFIT') ?? null //dados da equipe profit
      const vector = g.teams.find((t) => t.side === 'VECTOR') ?? null

      return {
        id: g.id,
        dataMatch: g.dataMatch,

        profit: profit
          ? {
              teamSelect: profit.teamSelect,
              score: profit.score,
              resultTag: profit.resultTag,
              playerOne: profit.playerOne?.nickName ?? null,
              playerTwo: profit.playerTwo?.nickName ?? null,
            }
          : null,

        vector: vector
          ? {
              teamSelect: vector.teamSelect,
              score: vector.score,
              resultTag: vector.resultTag,
              playerOne: vector.playerOne?.nickName ?? null,
              playerTwo: vector.playerTwo?.nickName ?? null,
            }
          : null,
      }
    })
  }

  async getStatsByNickName(nickName: string) {
    const stats = { wins: 0, loss: 0, draw: 0 }

    const player = await prisma.player.findFirst({
      where: { nickName },
      select: { id: true },
    })

    if (!player) {
      const error: any = new Error(`Nick não encontrado: ${nickName}`)
      error.statusCode = 404
      throw error
    }

    const playerId = player.id

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
          },
        },
      },
    })

    for (const g of allPlayerGames) {
      for (const t of g.teams) {
        const result = t.resultTag as ResultTag | null | undefined

        if (result === 'WINNER') {
          stats.wins++
        } else if (result === 'LOSS') {
          stats.loss++
        } else if (result === 'DRAW') {
          stats.draw++
        }
      }
    }

    return {
      nickName,
      playerId,
      totalGames: allPlayerGames.length,
      stats,
    }
  }
}
