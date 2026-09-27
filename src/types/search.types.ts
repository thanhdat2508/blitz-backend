export interface ChampionSearchResult {
  id: string;
  key: string;
  name: string;
  title: string;
  primaryClass?: string;
  roles: string[];
  avatarUrl: string;
  url: string;
}

export interface ProPlayerSearchResult {
  id: string;
  slug: string;
  name: string;
  nickname: string;
  team: string;
  role: string;
  avatar: string;
  riotGameName: string;
  riotTagLine: string;
  riotId: string;
}

export interface PostSearchResult {
  id: string;
  slug: string;
  title: string;
  contentSnippet?: string;
  coverImageUrl?: string | null;
  authorName?: string;
  createdAt: string;
}

export interface SummonerSearchResult {
  gameName: string;
  tagLine: string;
  region: string;
  riotId: string;
  isDirectLookup: boolean;
}

export interface GlobalSearchData {
  query: string;
  region: string;
  totalMatches: number;
  champions: ChampionSearchResult[];
  proPlayers: ProPlayerSearchResult[];
  posts: PostSearchResult[];
  summoner?: SummonerSearchResult;
}

export interface GlobalSearchResponse {
  success: boolean;
  data: GlobalSearchData;
}
