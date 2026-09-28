export interface MatchItem {
  id: number;
  name: string;
  icon: string;
}

export interface MatchSpell {
  name: string;
  icon: string;
}

export interface MatchRune {
  name: string;
  icon: string;
}

export interface ProPlayerMatch {
  championName: string;
  championTitle: string;
  championIcon: string;
  championSplash?: string;
  win: boolean;
  kills: number;
  deaths: number;
  assists: number;
  kdaRatio: string;
  cs: number;
  csPerMinute: string;
  gameDuration: string;
  gameMode: string;
  timeAgo: string;
  spells: MatchSpell[];
  runes: {
    primary: MatchRune;
    secondary: MatchRune;
  };
  items: MatchItem[];
}

export interface ProPlayerData {
  id: string;
  slug: string;
  gameId: string;
  name: string;
  nickname: string;
  description?: string;
  avatar: string;
  playerImageUrl: string;
  riotGameName: string;
  riotTagLine: string;
  role: "MID" | "TOP" | "JUNGLE" | "ADC" | "SUPPORT";
  team: string;
  themeColor: "blue" | "gold" | "red";
  displayOrder: number;
  lastMatch: ProPlayerMatch;
}

export const PRO_PLAYERS_DATA: ProPlayerData[] = [
  // Player 1: Team Whales Theme (Blue)
  {
    id: "player-1",
    slug: "whale-member",
    gameId: "Only Prime#duybt",
    name: "Duy",
    nickname: "Whale Storm",
    description: "Standout Mid Laner for Team Whales known for elusive mechanics, tempo control, and supreme mastery over high-impact control mages.",
    avatar: "https://res.cloudinary.com/vptfaug1/image/upload/player3.png",
    playerImageUrl: "https://res.cloudinary.com/vptfaug1/image/upload/player3.png",
    riotGameName: "Only Prime",
    riotTagLine: "duybt",
    role: "MID",
    team: "Team Whales",
    themeColor: "blue",
    displayOrder: 1,
    lastMatch: {
      championName: "Ahri",
      championTitle: "The Nine-Tailed Fox",
      championIcon: "https://ddragon.leagueoflegends.com/cdn/14.24.1/img/champion/Ahri.png",
      championSplash: "https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Ahri_0.jpg",
      win: true,
      kills: 12,
      deaths: 2,
      assists: 8,
      kdaRatio: "10.0",
      cs: 245,
      csPerMinute: "8.2",
      gameDuration: "29:54",
      gameMode: "Ranked Solo",
      timeAgo: "35 mins ago",
      spells: [
        {
          name: "Flash",
          icon: "https://ddragon.leagueoflegends.com/cdn/14.24.1/img/spell/SummonerFlash.png",
        },
        {
          name: "Teleport",
          icon: "https://ddragon.leagueoflegends.com/cdn/14.24.1/img/spell/SummonerTeleport.png",
        },
      ],
      runes: {
        primary: {
          name: "Electrocute",
          icon: "https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Domination/Electrocute/Electrocute.png",
        },
        secondary: {
          name: "Inspiration",
          icon: "https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/7203_Whimsy.png",
        },
      },
      items: [
        { id: 3089, name: "Rabadon's Deathcap", icon: "https://ddragon.leagueoflegends.com/cdn/14.24.1/img/item/3089.png" },
        { id: 6655, name: "Luden's Companion", icon: "https://ddragon.leagueoflegends.com/cdn/14.24.1/img/item/6655.png" },
        { id: 3157, name: "Zhonya's Hourglass", icon: "https://ddragon.leagueoflegends.com/cdn/14.24.1/img/item/3157.png" },
        { id: 3135, name: "Void Staff", icon: "https://ddragon.leagueoflegends.com/cdn/14.24.1/img/item/3135.png" },
        { id: 3020, name: "Sorcerer's Shoes", icon: "https://ddragon.leagueoflegends.com/cdn/14.24.1/img/item/3020.png" },
        { id: 4645, name: "Shadowflame", icon: "https://ddragon.leagueoflegends.com/cdn/14.24.1/img/item/4645.png" },
        { id: 3364, name: "Oracle Lens", icon: "https://ddragon.leagueoflegends.com/cdn/14.24.1/img/item/3364.png" },
      ],
    },
  },

  // Player 2: Gen.G Theme (Gold)
  {
    id: "player-2",
    slug: "geng-member",
    gameId: "melting in mouth#236",
    name: "BigH",
    nickname: "Chovy Jr.",
    description: "Prodigious Mid Laner for Gen.G Esports renowned for surgical lane pressure, perfect CS efficiency, and dominant Yone mechanics.",
    avatar: "https://res.cloudinary.com/vptfaug1/image/upload/player2.png",
    playerImageUrl: "https://res.cloudinary.com/vptfaug1/image/upload/player2.png",
    riotGameName: "melting in mouth",
    riotTagLine: "236",
    role: "MID",
    team: "Gen.G Esports",
    themeColor: "gold",
    displayOrder: 2,
    lastMatch: {
      championName: "Yone",
      championTitle: "The Unforgotten",
      championIcon: "https://ddragon.leagueoflegends.com/cdn/14.24.1/img/champion/Yone.png",
      championSplash: "https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Yone_0.jpg",
      win: true,
      kills: 14,
      deaths: 3,
      assists: 9,
      kdaRatio: "7.7",
      cs: 310,
      csPerMinute: "9.8",
      gameDuration: "31:40",
      gameMode: "Ranked Solo",
      timeAgo: "1 hour ago",
      spells: [
        {
          name: "Flash",
          icon: "https://ddragon.leagueoflegends.com/cdn/14.24.1/img/spell/SummonerFlash.png",
        },
        {
          name: "Ignite",
          icon: "https://ddragon.leagueoflegends.com/cdn/14.24.1/img/spell/SummonerDot.png",
        },
      ],
      runes: {
        primary: {
          name: "Conqueror",
          icon: "https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Precision/Conqueror/Conqueror.png",
        },
        secondary: {
          name: "Resolve",
          icon: "https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/7204_Resolve.png",
        },
      },
      items: [
        { id: 3031, name: "Infinity Edge", icon: "https://ddragon.leagueoflegends.com/cdn/14.24.1/img/item/3031.png" },
        { id: 3153, name: "Blade of the Ruined King", icon: "https://ddragon.leagueoflegends.com/cdn/14.24.1/img/item/3153.png" },
        { id: 3006, name: "Berserker's Greaves", icon: "https://ddragon.leagueoflegends.com/cdn/14.24.1/img/item/3006.png" },
        { id: 3072, name: "Bloodthirster", icon: "https://ddragon.leagueoflegends.com/cdn/14.24.1/img/item/3072.png" },
        { id: 3026, name: "Guardian Angel", icon: "https://ddragon.leagueoflegends.com/cdn/14.24.1/img/item/3026.png" },
        { id: 3071, name: "Black Cleaver", icon: "https://ddragon.leagueoflegends.com/cdn/14.24.1/img/item/3071.png" },
        { id: 3340, name: "Stealth Ward", icon: "https://ddragon.leagueoflegends.com/cdn/14.24.1/img/item/3340.png" },
      ],
    },
  },

  // Player 3: T1 Theme (Red)
  {
    id: "player-3",
    slug: "t1-member",
    gameId: "Uzumacchiato#ngohi",
    name: "Hiep",
    nickname: "Knight",
    description: "Franchise Bot Laner for T1 recognized for razor-sharp reflexes, immaculate teamfight positioning, and explosive hypercarry damage.",
    avatar: "https://res.cloudinary.com/vptfaug1/image/upload/player1.png",
    playerImageUrl: "https://res.cloudinary.com/vptfaug1/image/upload/player1.png",
    riotGameName: "Uzumacchiato",
    riotTagLine: "ngohi",
    role: "ADC",
    team: "T1",
    themeColor: "red",
    displayOrder: 3,
    lastMatch: {
      championName: "Jinx",
      championTitle: "The Loose Cannon",
      championIcon: "https://ddragon.leagueoflegends.com/cdn/14.24.1/img/champion/Jinx.png",
      championSplash: "https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Jinx_0.jpg",
      win: true,
      kills: 16,
      deaths: 1,
      assists: 10,
      kdaRatio: "26.0",
      cs: 295,
      csPerMinute: "10.1",
      gameDuration: "29:10",
      gameMode: "Ranked Solo",
      timeAgo: "2 hours ago",
      spells: [
        {
          name: "Flash",
          icon: "https://ddragon.leagueoflegends.com/cdn/14.24.1/img/spell/SummonerFlash.png",
        },
        {
          name: "Ghost",
          icon: "https://ddragon.leagueoflegends.com/cdn/14.24.1/img/spell/SummonerHaste.png",
        },
      ],
      runes: {
        primary: {
          name: "Lethal Tempo",
          icon: "https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Precision/LethalTempo/LethalTempoTemp.png",
        },
        secondary: {
          name: "Sorcery",
          icon: "https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/7202_Sorcery.png",
        },
      },
      items: [
        { id: 3031, name: "Infinity Edge", icon: "https://ddragon.leagueoflegends.com/cdn/14.24.1/img/item/3031.png" },
        { id: 3085, name: "Runaan's Hurricane", icon: "https://ddragon.leagueoflegends.com/cdn/14.24.1/img/item/3085.png" },
        { id: 3094, name: "Rapid Firecannon", icon: "https://ddragon.leagueoflegends.com/cdn/14.24.1/img/item/3094.png" },
        { id: 3036, name: "Lord Dominik's Regards", icon: "https://ddragon.leagueoflegends.com/cdn/14.24.1/img/item/3036.png" },
        { id: 3006, name: "Berserker's Greaves", icon: "https://ddragon.leagueoflegends.com/cdn/14.24.1/img/item/3006.png" },
        { id: 3072, name: "Bloodthirster", icon: "https://ddragon.leagueoflegends.com/cdn/14.24.1/img/item/3072.png" },
        { id: 3363, name: "Farsight Alteration", icon: "https://ddragon.leagueoflegends.com/cdn/14.24.1/img/item/3363.png" },
      ],
    },
  },
];