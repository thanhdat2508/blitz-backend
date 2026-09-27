import prisma from "../config/database";
import { PRO_PLAYERS_DATA, ProPlayerData } from "../data/pro-players.data";

export class ProPlayerService {
  /**
   * Lấy danh sách 3 pro player nổi bật cho trang chủ từ PostgreSQL (Prisma)
   */
  async getHighlights(): Promise<ProPlayerData[]> {
    try {
      const players = await (prisma as any).proPlayer.findMany({
        orderBy: { displayOrder: "asc" },
      });

      if (players && players.length > 0) {
        return players.map((p: any) => ({
          id: p.id,
          slug: p.slug,
          gameId: p.gameId || `${p.riotGameName || ''}#${p.riotTagLine || ''}`,
          name: p.name,
          nickname: p.nickname,
          description: p.description,
          avatar: p.avatar || p.playerImageUrl,
          playerImageUrl: p.playerImageUrl || p.avatar,
          riotGameName: p.riotGameName || p.gameId?.split('#')[0] || '',
          riotTagLine: p.riotTagLine || p.gameId?.split('#')[1] || '',
          role: p.role,
          team: p.team,
          themeColor: p.themeColor,
          displayOrder: p.displayOrder,
          lastMatch: p.lastMatch,
        }));
      }
    } catch (error) {
      console.warn("[ProPlayerService] Database query failed, using dataset fallback:", error);
    }

    return PRO_PLAYERS_DATA;
  }

  /**
   * Lấy chi tiết pro player theo slug từ PostgreSQL (Prisma)
   */
  async getPlayerBySlug(slug: string): Promise<ProPlayerData | null> {
    try {
      const player = await (prisma as any).proPlayer.findUnique({
        where: { slug },
      });

      if (player) {
        return {
          id: player.id,
          slug: player.slug,
          gameId: player.gameId || `${player.riotGameName || ''}#${player.riotTagLine || ''}`,
          name: player.name,
          nickname: player.nickname,
          description: player.description,
          avatar: player.avatar || player.playerImageUrl,
          playerImageUrl: player.playerImageUrl || player.avatar,
          riotGameName: player.riotGameName || player.gameId?.split('#')[0] || '',
          riotTagLine: player.riotTagLine || player.gameId?.split('#')[1] || '',
          role: player.role,
          team: player.team,
          themeColor: player.themeColor,
          displayOrder: player.displayOrder,
          lastMatch: player.lastMatch,
        };
      }
    } catch (error) {
      console.warn(`[ProPlayerService] Query for '${slug}' failed, using dataset fallback:`, error);
    }

    return PRO_PLAYERS_DATA.find((p) => p.slug === slug) || null;
  }
}

export const proPlayerService = new ProPlayerService();

