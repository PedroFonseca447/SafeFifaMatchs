import { prisma } from '../lib/prisma'

export class TeamsChoiceService {
  async create(name: string, stars: number) {
    if (!name || !stars) {
      const error: any = new Error('Bad request, o parametro foi passado de maneira errada')
      error.statusCode = 400
      throw error
    }

    let teamExist = await prisma.teamsChoice.findUnique({
      where: { nome: name },
    })

    if (teamExist) {
      const error: any = new Error(`esse nickname: ${name} já existe em nosso banco`)
      error.statusCode = 400
      throw error
    }


    const newTeam = await prisma.teamsChoice.create({
        data:{
            nome: name,
            stars: stars,
            nChoices: 1
        }
    })

    return newTeam;
  }




  async getQuantityChoice(teamName: string){
    const team = await prisma.teamsChoice.findFirst({
        where:{ nome: teamName}
    })


    
    if (!team) {
      const error: any = new Error(` Esse jogador${team} não foi encontrado`)
      error.statusCode = 400
      throw error
    }

    return team.nChoices;
  }
}
