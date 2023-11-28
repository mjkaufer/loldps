import _ from "lodash";
import { Champion } from "@/classes/champions/champion";
import {
  ChampStatus,
  ChampStatusName,
  TDamage,
  TEventContextWithTarget,
  TSkillCastContextWithTarget,
  TSkillOrAutoType,
} from "@/classes/champions/types";
import { abilityHasteToRatio } from "@/classes/champions/statUtils";

const STANDARD_TICK_TIME_MS = 33;

export class ChampSimulator {
  private champion: Champion;
  private targetChampion: Champion;
  private tickMs: number;
  // Champion is attacking targetChampion
  // Long term TODO: Multi-champ support, code as array
  constructor(champion: Champion, targetChampion: Champion) {
    this.champion = champion;
    this.targetChampion = targetChampion;
    this.tickMs = 0;
  }

  init = () => {
    this.champion.getState().init();
    this.targetChampion.getState().init();
  };

  onTick = () => {
    this.tickMs += STANDARD_TICK_TIME_MS;
  };

  buildContext = (): TEventContextWithTarget<Champion> => {
    const context: TEventContextWithTarget<Champion> = {
      champStats: this.champion.getStats(),
      currentTickMs: this.tickMs,
      championStatuses: this.champion.getState().statusMap,
      champion: this.champion,
      targetStatuses: this.targetChampion.getState().statusMap,
      targetChampion: this.targetChampion,
    };

    return context;
  };

  buildContextForSkillOrAuto = (
    skillOrAutoType: TSkillOrAutoType
  ): TSkillCastContextWithTarget<Champion> => {
    const championSkillProgression = this.champion.getSkillProgression();
    const context: TSkillCastContextWithTarget<Champion> = {
      ...this.buildContext(),
      skillLevel:
        skillOrAutoType in championSkillProgression
          ? championSkillProgression[
              skillOrAutoType as keyof typeof championSkillProgression
            ]
          : 0,
    };

    return context;
  };

  applyDamageToTarget = (
    damage: TDamage,
    context: TEventContextWithTarget<Champion>
  ) => {
    context.targetChampion.getState().takeDamage(damage, context);
  };

  decrementCooldowns = (champion: Champion = this.champion) => {
    champion.getState().reduceAllCooldowns(STANDARD_TICK_TIME_MS);
  };

  applySkillOrAuto = (skillOrAutoType: TSkillOrAutoType) => {
    const definition = this.champion.cls.skillDefinition[skillOrAutoType];
    const context = this.buildContextForSkillOrAuto(skillOrAutoType);
    const championStats = this.champion.getStats();
    const preDamage = definition.getPreDamage?.(context);
    if (preDamage) {
      this.applyDamageToTarget(preDamage, context);
    }

    definition.updateSelfStatuses?.(context);
    definition.updateTargetStatuses?.(context);
    this.updateStatuses(this.targetChampion);
    this.updateStatuses(this.champion);

    const cooldown =
      definition.getCooldown?.(context) ??
      definition.cooldownByLevel?.[context.skillLevel];
    if (cooldown === undefined) {
      // TODO: Auto attack cooldowns
      if (skillOrAutoType !== 'A') {
        throw new Error(
          `No cooldown found for ${this.champion.championName}'s ${skillOrAutoType}`
        );
      }
    } else {
      // Update cooldowns
      this.champion
        .getState()
        .setCooldown(
          skillOrAutoType,
          abilityHasteToRatio(championStats.abilityhaste) * cooldown
        );
    }


    const multiCooldowns = definition.getMultiCooldowns?.(context);
    if (multiCooldowns) {
      this.champion.getState().setCooldowns(multiCooldowns);
    }
  };

  updateStatuses = (championToUpdate: Champion) => {
    const statusMap = championToUpdate.getState().statusMap;
    const context = this.buildContext();

    (Object.keys(statusMap) as ChampStatusName[]).forEach((k) => {
      const statuses = statusMap[k];
      if (!statuses) {
        return;
      }

      statusMap[k] = (statuses as ChampStatus[]).filter((status): boolean => {
        // If we just registered a status, don't fire it this instant
        if (status.registeredAtMs === context.currentTickMs) {
          return true;
        }
        if ("expiresAtMs" in status && status.expiresAtMs !== null) {
          if (status.expiresAtMs > context.currentTickMs) {
            return false;
          }
        }

        if ("isDamageProc" in status) {
          // If we don't have a fire time, skip, but keep in case we update later
          if (!status.fireAtMs) {
            return true;
          }
          // If we fire in the future, keep for when we fire later
          if (status.fireAtMs > this.tickMs) {
            return true;
          }

          // TODO
          const damage = status.getDamage(context, status);
          if (damage) {
            this.applyDamageToTarget(damage, context);
            return status.removeOnProcess;
          }
        }

        // TODO: Process other event types

        // Keep by default
        return true;
      }) as $FIXME;
    });
  };
}
