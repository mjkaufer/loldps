import { ChampionState } from "@/classes/champions/championState";
import { mergeStats } from "@/classes/champions/statUtils";
import {
  ChampStatusMap,
  TChampionBaseStats,
  TChampionStats,
  TSkillDefinition,
  TSkillEntry,
  TSkillProgression,
} from "@/classes/champions/types";
import { CHAMPIONS_BY_PATCH } from "@/data/champions_raw";
import {
  LATEST_PATCH,
  PATCH_VERSIONS,
  TPatchVersion,
} from "@/data/constants/patchVersions";

export class Champion {
  // These should be set on champion def if a champ gets reworked, so we can
  // validate if a given champ invoked is being run on a valid version / filter
  // champs out of their versions
  static readonly startVersion: TPatchVersion = PATCH_VERSIONS[0];
  static readonly endVersion: TPatchVersion = LATEST_PATCH;
  // If disabled, can't run in sim
  static readonly enabled: boolean = false;

  public readonly championName: string;
  protected version: TPatchVersion;
  protected level: number = 1;
  protected skillProgression: TSkillProgression = { Q: 0, W: 0, E: 0, R: 0 };
  static readonly skillDefinition: TSkillDefinition<Champion> = {
    A: {
      cooldownByLevel: null,
      getPreDamage: (c) => ({ physical: c.champStats.attackdamage }),
    },
    P: { cooldownByLevel: null },
    Q: { cooldownByLevel: null },
    W: { cooldownByLevel: null },
    E: { cooldownByLevel: null },
    R: { cooldownByLevel: null },
  };

  protected state: ChampionState;

  constructor(championName: string, version: TPatchVersion = LATEST_PATCH) {
    this.championName = championName;
    this.version = version;
    this.state = new ChampionState(this);
    // TODO: Validate version is between start/end when we get semver code
  }

  // from https://stackoverflow.com/a/72508920/2009336
  get cls(): typeof Champion {
    return this.constructor as $FIXME;
  }

  getChampionJSON = () => {
    return CHAMPIONS_BY_PATCH[this.version].data[this.championName];
  };

  setLevel = (level: number) => {
    this.level = level;
  };

  
  receiveDamage = (postMitigationDamage: number) => {
    this.state.damageTaken += postMitigationDamage;
  };

  setSkillProgression = (skillProgression: TSkillProgression) => {
    this.skillProgression = skillProgression;
  };

  getSkillProgression = () => this.skillProgression;

  getLevelStats = (level: number = this.level): TChampionBaseStats => {
    const champStats = this.getChampionJSON().stats;
    return {
      armor: champStats.armor + champStats.armorperlevel * level,
      attackdamage:
        champStats.attackdamage + champStats.attackdamageperlevel * level,
      attackrange: champStats.attackrange,
      // TODO: attack speed scaling?
      attackspeed:
        champStats.attackspeed + champStats.attackspeedperlevel * level,
      crit: champStats.crit + champStats.critperlevel * level,
      hp: champStats.hp + champStats.hpperlevel * level,
      hpregen: champStats.hpregen + champStats.hpregenperlevel * level,
      movespeed: champStats.movespeed,
      mp: champStats.mp + champStats.mpperlevel * level,
      mpregen: champStats.mpregen + champStats.mpregenperlevel * level,
      spellblock: champStats.spellblock + champStats.spellblockperlevel * level,
    };
  };

  getState = () => {
    return this.state;
  };

  setState = (state: ChampionState) => {
    this.state = state;
  };

  // Stats from skills, i.e. mord mpen
  // TODO, implement, maybe take in existing statblock as arg
  getSkillStats = (skillProgression: TSkillProgression) => {};

  // Stats from statuses, i.e. mord ult, etc.
  // TODO, implement, maybe take in existing statblock as arg
  getStatusStats = (): TChampionStats => {
    const statusMap = this.state.statusMap;
    return {
      armor: 0,
      attackdamage: 0,
      attackrange: 0,
      attackspeed: 0,
      crit: 0,
      hp: 0,
      hpregen: 0,
      movespeed: 0,
      mp: 0,
      mpregen: 0,
      spellblock: 0,
      abilitypower: 0,
      abilityhaste: 0,
      omnivamp: 0,
      lifesteal: 0,
      lethality: 0,

      pctarmorpen: 0,
      armorpen: 0,

      magicpen: 0,
      pctmagicpen: 0,
    };
  };

  // Stats from items, i.e. rabadons
  // TODO, implement, maybe take in existing statblock as arg
  getItemStats = (): TChampionStats => {
    return {
      armor: 0,
      attackdamage: 0,
      attackrange: 0,
      attackspeed: 0,
      crit: 0,
      hp: 0,
      hpregen: 0,
      movespeed: 0,
      mp: 0,
      mpregen: 0,
      spellblock: 0,
      abilitypower: 0,
      abilityhaste: 0,
      omnivamp: 0,
      lifesteal: 0,
      lethality: 0,

      pctarmorpen: 0,
      armorpen: 0,

      magicpen: 0,
      pctmagicpen: 0,
    };
  };

  // Gets all stats, from items, statuses, etc., combines
  // TODO
  getStats = (): TChampionStats => {
    return mergeStats(
      this.getLevelStats(),
      this.getStatusStats()
    );
  };
}
