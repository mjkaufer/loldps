import { Champion } from "@/classes/champions/champion";
import {
  TChampionStats,
  TDamage,
  TEventContextWithTarget,
  TSkillCastContextWithTarget,
} from "@/classes/champions/types";

// Stuff like Jhin W mark, etc.
export enum ChampStatusName {
  MordPassive = "MordPassive",
  MordUltSelf = "MordUltSelf",
  MordUltTarget = "MordUltTarget",
  // MordPassiveDamageProc = "MordPassiveDamageProc",
}

export type TStackable = {
  stacks: number;
  // TODO: Generic tick handler for different events
  // i.e. stack handler
  stackExpiryMs?: number;
  isStackable: true;
};

export type TDamageProc<SN extends ChampStatusName> = {
  fireAtMs: number | null;
  getDamage: (context: TEventContextWithTarget<Champion>, self: ChampStatus<SN>) => TDamage | undefined;
  isDamageProc: true;
};

export type StatMod = {
  stats: Partial<TChampionStats>;
  isStatMod: true;
};

// TODO: Maybe make some kind of "consume" / "apply" method that we can reuse for statuses
type _TChampStatusNameToState = {
  [ChampStatusName.MordPassive]: TStackable & TDamageProc<ChampStatusName.MordPassive>;
  // [ChampStatusName.MordPassiveDamageProc]: TDamageProc;
  [ChampStatusName.MordUltSelf]: StatMod;
  [ChampStatusName.MordUltTarget]: StatMod;
};

// type TStatusTickEffect = {

// }

// const STATUS_TICK_EFFECT: Partial<Record<ChampStatusName, TStatusTickEffect>> = {
//   [ChampStatusName.MordPassiveDamageProc]: 
// }

export type TBaseStatusInfo = {
  expiresAtMs: number | null;
  // This way we don't add a proc and also re-evaluate it
  registeredAtMs: number;
  removeOnProcess: boolean;
};

export type TChampStatusNameToState = {
  [K in keyof _TChampStatusNameToState]: (_TChampStatusNameToState[K] & {
    status: K;
  } & TBaseStatusInfo)[];
};

export type ChampStatus<C extends ChampStatusName = ChampStatusName> =
  TChampStatusNameToState[C][number];

export type ChampStatusMap = Partial<TChampStatusNameToState>;
