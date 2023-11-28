import { Champion } from "@/classes/champions/champion";
import {
  ChampStatusName,
  ChampStatus,
  ChampStatusMap,
} from "@/classes/champions/types/statuses";

export * from "./statuses";

// Stats that come from champion itself
export type TChampionBaseStats = {
  // TODO: Omnivamp / lifesteal?
  // TODO: AS scaling?
  armor: number;
  attackdamage: number;
  attackrange: number;
  attackspeed: number;
  crit: number;
  hp: number;
  hpregen: number;
  movespeed: number;
  mp: number;
  mpregen: number;
  spellblock: number;
};

// Come from items, etc.
export type TChampionStats = TChampionBaseStats & {
  abilitypower: number;
  abilityhaste: number;
  omnivamp: number;
  lifesteal: number;
  lethality: number;

  pctarmorpen: number; // stored as 0-100 to make easier to read :)
  armorpen: number;

  magicpen: number;
  pctmagicpen: number; // stored as 0-100 to make easier to read :)
  // todo: pen
};

export type TSkillOrAutoType = "A" | "P" | "Q" | "W" | "E" | "R";

export type TSkillProgression = {
  Q: number;
  W: number;
  E: number;
  R: number;
};

export type TCooldowns = {
  A: number;
  P: number;
  Q: number;
  W: number;
  E: number;
  R: number;
};

export type TEventContext<C extends Champion> = {
  champStats: TChampionStats;
  champion: C;
  championStatuses: ChampStatusMap; // TODO: Maybe remove? Since we can get from state
  currentTickMs: number;
};

type _TSkillCastContext = {
  skillLevel: number;
};

export type TSkillCastContext<C extends Champion> = TEventContext<C> &
  _TSkillCastContext;

export type TEventContextWithTarget<C extends Champion> = TEventContext<C> & {
  // Any marks to consume, i.e. Cass E
  targetStatuses: ChampStatusMap;
  targetChampion: Champion;
};

// C here is the casting champ / current champ, not target
export type TSkillCastContextWithTarget<C extends Champion> =
  TEventContextWithTarget<C> & _TSkillCastContext;

// Description of a skill at a single level
// Applies to passives as well
// TODO: Build composer so we can chain multiple
// TODO: Cast times
export type TSkillEntry<C extends Champion> = {
  // Order of execution is getPreDamage(), then updateStatuses()
  // getStaticPassiveStats should only happen once at start

  // If null, no relevant cooldown, i.e. buff passives
  // Unit of seconds
  cooldownByLevel: number[] | null;

  // All damage is premitigation damage
  getPreDamage?: (
    context: TSkillCastContextWithTarget<C>
  ) => TDamage | undefined;

  // I.e. mord passive only fires each tick
  getQueuedDamage?: (
    context: TSkillCastContextWithTarget<C>
  ) => TQueuedDamage<C> | undefined;

  modifyPreAutoDamage?: (
    autoDamage: TDamage,
    context: TSkillCastContextWithTarget<C>
  ) => TDamage | undefined;

  // Consumes any marks, etc.
  updateSelfStatuses?: (
    context: TSkillCastContextWithTarget<C>
  ) => ChampStatusMap | undefined;
  updateTargetStatuses?: (
    context: TSkillCastContextWithTarget<C>
  ) => ChampStatusMap | undefined;

  // Unit of seconds
  getCooldown?: (context: TSkillCastContextWithTarget<C>) => number | undefined;

  // Returns new absolute cooldown, either for current ability, or for all abilities
  // Unit of seconds
  getMultiCooldowns?: (
    context: TSkillCastContextWithTarget<C>
  ) => Partial<TCooldowns> | undefined;

  // Stuff like Braum W, fires on spell cast
  // TODO: Probably deprecate this and move to a status instead
  /** @deprecated */
  getActiveStatMod?: (
    context: TSkillCastContextWithTarget<C>
  ) => Partial<TChampionStats> | undefined;

  // Stuff like Mord E, Panth R, etc., happens passively
  getPassiveStatMod?: (
    context: TSkillCastContext<C>
  ) => Partial<TChampionStats> | undefined;

  // If true, disable other abilities; only set if true, otherwise ignore
  isChannel?: true;
  autoReset?: true;
};

export type TSkillDefinition<C extends Champion> = {
  A: TSkillEntry<C>;
  // TODO: Maybe worth moving passives to just implementations within the defs
  // since they don't really get cast, unlike the other skills
  P: TSkillEntry<C>;
  Q: TSkillEntry<C>;
  W: TSkillEntry<C>;
  E: TSkillEntry<C>;
  R: TSkillEntry<C>;
};

export type TDamage = {
  physical?: number;
  magic?: number;
  true?: number;
};

export type TGetDamage<C extends Champion> = (
  context: TSkillCastContextWithTarget<C>
) => TDamage;

export type TQueuedDamage<C extends Champion> = {
  damage: TDamage | TGetDamage<C>;
} & {
  fireAt: number;
  // For preventing multiple procs
  damageKey?: string;
};
