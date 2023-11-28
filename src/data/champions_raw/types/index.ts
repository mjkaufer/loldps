export type TChampionFull = {
  // champion name
  data: Record<string, TChampInfoFull>;
};

type TPassive = {
  description: string;
  name: string;
};

type TSpell = {
  id: string;
  name: string;
  cooldown: number[];
  cost: number[];
  description: string;
  effect: (null | number[])[];
  effectBurn: (null | string)[];
  leveltip?: {
    effect: string[];
    label: string[];
  };
  maxammo: string;
  maxrank: number;
  range: number[];
  rangeBurn: string;
  resource?: string;
  tooltip: string;
};

type TStats = {
  armor: number;
  armorperlevel: number;
  attackdamage: number;
  attackdamageperlevel: number;
  attackrange: number;
  attackspeed: number;
  attackspeedperlevel: number;
  crit: number;
  critperlevel: number;
  hp: number;
  hpperlevel: number;
  hpregen: number;
  hpregenperlevel: number;
  movespeed: number;
  mp: number;
  mpperlevel: number;
  mpregen: number;
  mpregenperlevel: number;
  spellblock: number;
  spellblockperlevel: number;
};

export type TChampInfoFull = {
  name: string;
  passive: TPassive;
  spells: TSpell[];
  title: string;
  stats: TStats;
};
