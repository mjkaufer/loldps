import _ from "lodash";
import { Champion } from "@/classes/champions/champion";
import { getPostMitigationDamage } from "@/classes/champions/statUtils";
import {
  ChampStatusMap,
  TCooldowns,
  TDamage,
  TEventContextWithTarget,
  TSkillOrAutoType,
} from "@/classes/champions/types";

// Wrapper around champion for simulation purposes
// Simulator should track tuple of champion and their state
export class ChampionState {
  private champion: Champion;
  public statusMap: ChampStatusMap = {};
  // Stored in seconds
  // TODO: Make more robust for other cooldowns?
  public cooldowns: TCooldowns = {
    A: 0,
    P: 0,
    Q: 0,
    W: 0,
    E: 0,
    R: 0,
  };
  public damageTaken: number = 0;

  constructor(champion: Champion) {
    this.champion = champion;
    // TODO: Seed base cooldowns from champion
  }

  init = () => {
    this.damageTaken = 0;
  }

  takeDamage = (
    damage: TDamage,
    context: TEventContextWithTarget<Champion>
  ) => {
    this.damageTaken += getPostMitigationDamage(damage, context);
  };

  // Mostly just used for event ticks
  reduceAllCooldowns = (reductionMs: number) => {
    _.forEach(this.cooldowns, (val, cooldownName) => {
      this.cooldowns[cooldownName as keyof TCooldowns] = Math.max(
        this.cooldowns[cooldownName as keyof TCooldowns] - reductionMs / 1000,
        0
      );
    });
  };

  setCooldown = (key: TSkillOrAutoType, cooldownSecs: number) => {
    this.cooldowns[key] = cooldownSecs;
  };

  setCooldowns = (cooldowns: Partial<TCooldowns>) => {
    (Object.keys(cooldowns) as TSkillOrAutoType[]).forEach((cooldownKey) => {
      const cooldownValue = cooldowns[cooldownKey];
      if (cooldownValue !== undefined) {
        this.cooldowns[cooldownKey] = cooldownValue;
      }
    });
  };

  // TODO: Support
  reset = () => {
    this.damageTaken = 0;
    this.cooldowns = {
      A: 0,
      P: 0,
      Q: 0,
      W: 0,
      E: 0,
      R: 0,
    };
  };
}
