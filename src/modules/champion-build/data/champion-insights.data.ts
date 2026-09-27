export interface ChampionSpecificInsightConfig {
  key: string;
  name: string;
  general: string[];
  strengths: string[];
  weaknesses: string[];
  matchupTipsAgainstOpponent?: Record<string, string[]>;
}

export const CURATED_CHAMPION_INSIGHTS: Record<string, ChampionSpecificInsightConfig> = {
  Quinn: {
    key: "Quinn",
    name: "Quinn",
    general: [
      "Kennen can get over most walls with [E] when cast toward them.",
      "Kennen's damaging abilities also apply [P].",
      "[P] reveals enemies it affects.",
      "[Q] only applies Nearsight to the initial target.",
      "[R]'s bonus movespeed is lost for 3 seconds if she takes damage from non-minions.",
    ],
    strengths: [
      "Can proc [P] multiple times in fights.",
      "Excels with items that boost her attack damage, critical strike chance, and movement speed.",
      "[W]'s movespeed and attack speed buffs make her hard to trade with.",
      "Very strong laner, and is considered to be a lane bully.",
    ],
    weaknesses: [
      "Due to her aggressive playstyle, it can leave her exposed to being ganked and/or flanked.",
      "Needs a lead to stay ahead, and falls off if she doesn't get one.",
      "[W] has a high cooldown of 50 seconds at rank 1. Once used, she can be punished.",
    ],
    matchupTipsAgainstOpponent: {
      Kennen: [
        "Kennen can get over most walls with [E] when cast toward them.",
        "Kennen's damaging abilities also apply [P].",
      ],
      Malphite: [
        "Malphite's [Q] steals movespeed; disengage immediately when hit.",
        "Save [E] to interrupt Malphite's engage follow-up.",
      ],
      Teemo: [
        "Teemo's [Q] blind prevents proc'ing [P]; do not trade while blinded.",
        "Use [W] vision to detect shroom placements near bushes.",
      ],
    },
  },

  Kennen: {
    key: "Kennen",
    name: "Kennen",
    general: [
      "Kennen can get over most walls with [E] when cast toward them.",
      "Kennen's damaging abilities also apply [P].",
      "[R] strikes multiple times and rapidly stacks [P] stuns in teamfights.",
    ],
    strengths: [
      "Game-changing area-of-effect teamfight engage with [E] into [R].",
      "Passive [P] stuns provide continuous lockdown and self-peel.",
      "Ranged auto-attacks make him an oppressive lane bully against melee champions.",
    ],
    weaknesses: [
      "Vulnerable when [E] Lightning Rush is on cooldown.",
      "Heavily reliant on Flash to execute optimal [R] flanking angles.",
      "Energy costs can become restrictive in prolonged trades without hitting [W].",
    ],
  },

  Ahri: {
    key: "Ahri",
    name: "Ahri",
    general: [
      "[Q] deals true damage on the return path, so repositioning after cast is essential.",
      "[E] interrupts enemy dashes and amplifies follow-up magic damage.",
      "[R] Spirit Rush gains additional dash charges upon champion takedowns.",
    ],
    strengths: [
      "Extremely high mobility and dive safety post-level 6 with [R].",
      "Excellent pick potential through fog of war using [E] Charm.",
      "Passive [P] provides consistent lane sustain when clearing waves.",
      "Versatile waveclear allows effective roaming to side lanes.",
    ],
    weaknesses: [
      "Missing [E] leaves her vulnerable to being engaged upon with zero peel.",
      "Relies heavily on landing [Q] sweetspots to maximize burst damage.",
      "Mobility drops drastically when [R] is on cooldown.",
    ],
  },

  Aatrox: {
    key: "Aatrox",
    name: "Aatrox",
    general: [
      "Hitting [Q] sweetspots knocks up enemies and deals significantly increased damage.",
      "[E] can be cast during [Q] animation to alter the strike destination.",
      "[R] amplifies all self-healing, synergizing with passive [P] and Conqueror.",
    ],
    strengths: [
      "Monstrous teamfight sustain and area-of-effect damage with [Q] and [R].",
      "Passive [P] enables heavy short trades and tower chipping in lane.",
      "Resets [R] duration upon takedowns, allowing chained teamfight sweeps.",
      "Does not use mana, allowing persistent lane presence.",
    ],
    weaknesses: [
      "High reliance on landing [Q] sweetspots; deals minimal damage if sweetspots miss.",
      "Heavily impaired by Grievous Wounds and anti-healing items.",
      "Long cooldowns on [E] early in laning phase make dodging crucial skillshots difficult.",
    ],
  },

  LeeSin: {
    key: "LeeSin",
    name: "Lee Sin",
    general: [
      "[Q] deals execute damage based on the target's missing health.",
      "[W] grants life steal and spell vamp, making double-tapping optimal for clearing camps.",
      "[R] knocks targets into their teammates, applying an AoE knockup.",
    ],
    strengths: [
      "Unmatched early-game skirmish dominance and jungle invades with [Q].",
      "Extremely high mobility and outplay potential using [W] ward hops.",
      "Insec [R] kicks can instantly isolate enemy carries in teamfights.",
      "Passive [P] ensures high attack speed and rapid energy recovery.",
    ],
    weaknesses: [
      "Damage output falls off significantly in late-game 5v5 front-to-back teamfights.",
      "High mechanical execution requirement; missing [Q] severely reduces threat.",
      "Energy management is critical; whiffing abilities leaves him resource-starved.",
    ],
  },

  Yasuo: {
    key: "Yasuo",
    name: "Yasuo",
    general: [
      "[Q] can critically strike and applies on-hit effects; stacks Gathering Storm.",
      "[W] Wind Wall completely blocks all enemy projectiles and ranged auto-attacks.",
      "[R] requires an airborne target, granting maximum Flow and 50% bonus armor penetration.",
    ],
    strengths: [
      "Infinite mobility through enemy minion waves with [E].",
      "Extremely high DPS scaling with 100% crit chance achieved at two items.",
      "[W] can completely neutralize key enemy ultimates and projectile CC.",
      "Passive [P] shield absorbs poke and favorable short trades in lane.",
    ],
    weaknesses: [
      "Extremely prone to jungle ganks when pushing lanes forward with [E].",
      "Melee range makes him vulnerable to heavy crowd control compositions.",
      "Requires allied knockups or landing [Q] tornado to cast [R] independently.",
    ],
  },

  Zed: {
    key: "Zed",
    name: "Zed",
    general: [
      "[W] shadow mimics [Q] and [E], doubling potential burst damage.",
      "[R] grants untargetability on cast and pops after 3 seconds based on damage dealt.",
      "Passive [P] deals bonus magic damage to targets below 50% health.",
    ],
    strengths: [
      "Top-tier single-target assassination and escape capability.",
      "Safe farming and poking from distance with [W] into [Q] combos.",
      "High split-push pressure in side lanes during mid game.",
      "Energy-based resource allows continual lane harass.",
    ],
    weaknesses: [
      "Directly countered by Stopwatch, Zhonya's Hourglass, and Guardian Angel.",
      "Struggles in grouped late-game teamfights against heavy frontline peel.",
      "Missing [Q] shurikens during [R] window drastically reduces pop damage.",
    ],
  },

  Jinx: {
    key: "Jinx",
    name: "Jinx",
    general: [
      "[Q] Fishbones rockets consume mana and provide extra range and AoE damage.",
      "Passive [P] Get Excited! grants massive movespeed and attack speed upon takedowns.",
      "[R] Super Mega Death Rocket deals increased damage based on missing health and distance.",
    ],
    strengths: [
      "Unrivaled late-game teamfight DPS when passive [P] triggers.",
      "Global [R] pressure allows sniping low-health enemies across the map.",
      "High siege and objective taking speed with [Q] Pow-Pow minigun stacks.",
    ],
    weaknesses: [
      "Zero innate dashes or mobility before passive [P] triggers; vulnerable to divers.",
      "Susceptible to assassins and flankers if caught without team protection.",
      "Requires multiple items and high economy to achieve hypercarry status.",
    ],
  },

  Thresh: {
    key: "Thresh",
    name: "Thresh",
    general: [
      "[Q] Death Sentence stuns and allows Thresh to pull himself to the target.",
      "[W] Dark Passage provides an ally a shield and a dash escape route.",
      "[E] Flay can interrupt enemy dashes like Leona's E or Tristana's W.",
    ],
    strengths: [
      "The most versatile support kit in League with engage, peel, and lantern escapes.",
      "Passive [P] collects souls, continuously scaling armor and ability power.",
      "Can make game-winning pickoffs with [Q] and [R] The Box lockdown.",
    ],
    weaknesses: [
      "Missing [Q] leaves long windows of vulnerability.",
      "No innate magic resist per level, making him vulnerable to AP poke supports.",
      "Requires high coordination with teammates to utilize [W] lantern effectively.",
    ],
  },

  Malphite: {
    key: "Malphite",
    name: "Malphite",
    general: [
      "[R] Unstoppable Force cannot be interrupted and knocks up all enemies in the area.",
      "[W] passively increases armor, scaling with total armor items.",
      "[E] Ground Slam reduces enemy attack speed by up to 50%, devastating ADCs.",
    ],
    strengths: [
      "One of the most reliable and impactful teamfight engages in the entire game.",
      "Armor scaling makes him nearly unkillable against full AD team compositions.",
      "Passive [P] Granite Shield provides continuous trading durability in lane.",
    ],
    weaknesses: [
      "High mana consumption early in the laning phase with [Q] spam.",
      "Low kill pressure and utility before unlocking [R] at level 6.",
      "Vulnerable to heavy AP poke and true damage champions.",
    ],
  },

  Darius: {
    key: "Darius",
    name: "Darius",
    general: [
      "[Q] Decimate only heals and applies max damage on the outer axe blade; inside hits deal reduced damage.",
      "Passive [P] Hemorrhage grants Noxian Might upon reaching 5 stacks, granting massive bonus AD.",
      "[R] Noxian Guillotine resets cooldown upon killing a target, dealing true damage.",
    ],
    strengths: [
      "Unrivaled extended trade dominance once passive [P] Noxian Might is triggered.",
      "High sustain in skirmishes when hitting multiple champions with outer [Q].",
      "True damage execute on [R] bypasses tank armor.",
      "Oppressive lane bully against melee top laners.",
    ],
    weaknesses: [
      "Susceptible to heavy kiting and slow chaining with zero innate dashes.",
      "Missing outer [Q] drastically reduces dueling power and healing.",
      "Prone to jungle ganks when pushing lanes forward.",
    ],
  },

  Jax: {
    key: "Jax",
    name: "Jax",
    general: [
      "[E] Counter Strike completely dodges incoming basic attacks and reduces AoE damage by 25%.",
      "[Q] Leap Strike can target both enemy units and allied wards or minions for escape.",
      "[R] Grandmaster's Might grants bonus resistances scaling with total AD and AP.",
    ],
    strengths: [
      "Incredible 1v1 dueling and split-push threat scaling into late game.",
      "[E] Counter Strike completely counters auto-attack reliant champions and ADCs.",
      "Passive [P] Relentless Assault ramps attack speed continuously in fights.",
      "Short [Q] leap cooldown allows constant repositioning.",
    ],
    weaknesses: [
      "Vulnerable to magic damage burst and hard crowd control when [E] is down.",
      "Requires farm and multi-item scaling to reach peak effectiveness.",
      "Early laning can be punished by long-range poke champions.",
    ],
  },

  Vayne: {
    key: "Vayne",
    name: "Vayne",
    general: [
      "[W] Silver Bolts deals percentage maximum health true damage on every third consecutive attack.",
      "[Q] Tumble resets auto-attack timer; gains 1-second invisibility during [R].",
      "[E] Condemn stuns targets for 1.5 seconds if they collide with terrain.",
    ],
    strengths: [
      "Unrivaled tank shredding with [W] true damage that cannot be mitigated.",
      "Extreme outplay and kiting potential with invisibility during [R] into [Q].",
      "Passive [P] Night Hunter grants bonus movement speed when hunting enemies.",
    ],
    weaknesses: [
      "Short 550 auto-attack range and zero AoE waveclear abilities.",
      "Weak early laning phase susceptible to heavy poke and push comps.",
      "Highly vulnerable to point-and-click crowd control.",
    ],
  },

  Lux: {
    key: "Lux",
    name: "Lux",
    general: [
      "[Q] Light Binding binds up to two enemy units, enabling guaranteed follow-up burst.",
      "Passive [P] Illumination charges targets with light; basic attacks or [R] detonate it for extra damage.",
      "[R] Final Spark has a very short cooldown and can snipe low-health targets from extreme distance.",
    ],
    strengths: [
      "Extreme pick and burst potential from extreme safe range.",
      "[W] Prismatic Barrier provides teamwide double-shielding in teamfights.",
      "Fast waveclear and low [R] cooldown allows frequent lane pressure.",
    ],
    weaknesses: [
      "100% skillshot reliant; missing [Q] leaves her completely defenseless.",
      "Zero mobility dashes; extremely vulnerable to dive assassins.",
      "Fragile base stats make her prone to being one-shot if caught out of position.",
    ],
  },

  Yone: {
    key: "Yone",
    name: "Yone",
    general: [
      "[E] Soul Unbound leaves his physical body behind, storing 25-35% of damage to repeat as true damage.",
      "[Q] Mortal Steel stacks Gathering Storm, granting a dash knockup on third cast.",
      "[R] Fate Sealed blinks behind all enemies struck, pulling them together and knocking them airborne.",
    ],
    strengths: [
      "Exceptional engage and dive potential with [E] into [R].",
      "Passive [P] Way of the Hunter doubles critical strike chance.",
      "Mixed physical, magic, and true damage makes defensive itemization hard for enemies.",
      "Safely returns to [E] body anchor regardless of crowd control.",
    ],
    weaknesses: [
      "Predictable return location at [E] anchor can be camped by enemy burst.",
      "Melee range leaves him vulnerable to heavy harass before level 3.",
      "Missing [R] leaves him deeply out of position inside enemy lines.",
    ],
  },

  Caitlyn: {
    key: "Caitlyn",
    name: "Caitlyn",
    general: [
      "[W] Yordle Snap Trap grants guaranteed Headshot passive [P] damage and increased range.",
      "[E] 90 Caliber Net knocks Caitlyn backward while slowing the target and triggering [P] Headshot.",
      "[R] Ace in the Hole channels a long-range shot that can be blocked by enemy champions.",
    ],
    strengths: [
      "Longest base auto-attack range (650) allows oppressive early laning and tower siege.",
      "Massive burst critical headshots through [W] trap placement and [E] net combos.",
      "Excellent zone control during Dragon and Baron setups.",
    ],
    weaknesses: [
      "Mid-game power trough before achieving 3 completed critical items.",
      "Low sustained DPS in close quarters if traps and net are bypassed.",
      "Immature escape tools make her susceptible to flankers when [E] is down.",
    ],
  },

  Ezreal: {
    key: "Ezreal",
    name: "Ezreal",
    general: [
      "[Q] Mystic Shot reduces all ability cooldowns by 1.5 seconds upon hitting an enemy.",
      "[W] Essence Flux attaches to targets and detonates for high burst when hit by any ability or attack.",
      "[E] Arcane Shift is a premier blink escape and reposition tool.",
    ],
    strengths: [
      "One of the safest ADCs with [E] blink avoiding key engage skillshots.",
      "Extreme long-range poke and constant siege pressure with [Q].",
      "Passive [P] Rising Spell Force grants up to 50% bonus attack speed in fights.",
      "Global waveclear and cross-map snipe utility with [R] Trueshot Barrage.",
    ],
    weaknesses: [
      "100% skillshot reliant; missing [Q] severely reduces DPS and cooldown reduction.",
      "Low waveclear compared to traditional crit marksmen.",
      "Struggles against heavy minion waves that block [Q] poke.",
    ],
  },

  Blitzcrank: {
    key: "Blitzcrank",
    name: "Blitzcrank",
    general: [
      "[Q] Rocket Grab pulls an enemy to Blitzcrank, creating instantaneous 5v4 pickoffs.",
      "[W] Overdrive grants burst movespeed but slows Blitzcrank by 30% for 1 second upon expiring.",
      "[R] Static Field silences nearby enemies and removes damage shields.",
    ],
    strengths: [
      "The highest game-turning pickoff potential in League with [Q] Rocket Grab.",
      "[R] Static Field completely destroys high-value shields from items or supports.",
      "Passive [P] Mana Barrier gives unexpected burst durability when low.",
    ],
    weaknesses: [
      "[Q] has a high 20-second cooldown early; missing it concessions lane pressure.",
      "[W] self-slow after activation leaves him exposed to counter-attack.",
      "Low damage contribution once initial ability rotation is spent.",
    ],
  },
};

export const COMMON_OPPONENT_TIPS: Record<string, string[]> = {
  Kennen: [
    "Kennen can get over most walls with [E] when cast toward them.",
    "Kennen's damaging abilities also apply [P].",
  ],
  Malphite: [
    "Malphite's [R] is unstoppable; maintain flash ready or spread out in teamfights.",
    "Do not engage extended trades when his passive [P] shield is active.",
  ],
  Zed: [
    "Zed appears behind you when exiting [R]; save CC for that exact spot.",
    "Bait out his [W] shadow before committing high cooldown abilities.",
  ],
  Yasuo: [
    "Bait out [W] Wind Wall before casting key ultimate skillshots.",
    "Pop his passive [P] shield with a basic auto-attack before committing abilities.",
  ],
  Ahri: [
    "Dodge [E] Charm to completely invalidate her burst trade window.",
    "Punish her whenever [R] is on cooldown as her escape mobility drops.",
  ],
  Blitzcrank: [
    "Stand behind minion waves to block [Q] Rocket Grab angles.",
    "Punish him aggressively when [Q] is on its long 20-second early cooldown.",
  ],
};
