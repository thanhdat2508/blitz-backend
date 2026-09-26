import { PRO_PLAYERS_DATA, ProPlayerData } from "../data/pro-players.data";

export class ProPlayerService {
  /**
   * Lấy danh sách 3 pro player nổi bật cho trang chủ
   */
  getHighlights(): ProPlayerData[] {
    return PRO_PLAYERS_DATA;
  }

  /**
   * Lấy chi tiết pro player theo slug
   */
  getPlayerBySlug(slug: string): ProPlayerData | null {
    return PRO_PLAYERS_DATA.find((p) => p.slug === slug) || null;
  }
}

export const proPlayerService = new ProPlayerService();
