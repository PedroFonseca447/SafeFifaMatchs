import { prisma } from "../lib/prisma";


export async function getPlayerId(nickname: string): Promise<string | null> {
  // se não tiver nickname (ex: jogo 1x1 ou 2x1 sem esse slot)
  if (!nickname) {
    return null;
  }

  let player = await prisma.player.findFirst({
    where: { nickName: nickname }, 
  });

  if (!player) {
    return '';
  }


  return player.id;
}


