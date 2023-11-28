import _ from "lodash";
import {
  TChampionStats,
  TDamage,
  TEventContextWithTarget,
  TSkillCastContextWithTarget,
} from "@/classes/champions/types";
import { Champion } from "@/classes/champions/champion";

export function getFractionalStats(stats: TChampionStats, ratio: number) {
  return _.mapValues(stats, (stat) => ratio * stat);
}

export function abilityHasteToRatio(ah: number) {
  return ah / (ah + 100);
}


// TODO: Handle goofy lethality edge case when invoking resistsToRatio
// TODO: Handle pen vs reduction
// The value for "resists" should be post-reduction (but pre-pen)
// pctResistPen is typically [0, 1], i.e. 100% is passed in as 1.0
export function resistsToRatio(
  resists: number,
  flatResistPen: number,
  pctResistPen: number
) {
  const newResists = resists * (1 - pctResistPen) - flatResistPen;

  const resistRatio = 100 / (100 + newResists);
  return newResists >= 0 ? resistRatio : 2 - resistRatio;
}

export function getPostMitigationDamage(
  damage: TDamage,
  context: TEventContextWithTarget<Champion>
) {
  const attackerStats = context.champion.getStats();
  const targetStats = context.targetChampion.getStats();
  const magicDamage = damage.magic
    ? resistsToRatio(
        targetStats.spellblock,
        attackerStats.magicpen,
        attackerStats.pctmagicpen
      )
    : 0;

  const physicalDamage = damage.physical
    ? resistsToRatio(
        targetStats.armor,
        attackerStats.armorpen,
        attackerStats.pctarmorpen
      )
    : 0;

  return magicDamage + physicalDamage + (damage.true ?? 0);
}

export function mergeStats(...statsArr: Partial<TChampionStats>[]) {
  const aggStats: TChampionStats = {
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

  statsArr.forEach((stat) => {
    aggStats.armor += stat.armor ?? 0;
    aggStats.attackdamage += stat.attackdamage ?? 0;
    aggStats.attackrange += stat.attackrange ?? 0;
    aggStats.attackspeed += stat.attackspeed ?? 0; // TODO: Make this work intelligently
    aggStats.crit += stat.crit ?? 0;
    aggStats.hp += stat.hp ?? 0;
    aggStats.hpregen += stat.hpregen ?? 0;
    aggStats.movespeed += stat.movespeed ?? 0;
    aggStats.mp += stat.mp ?? 0;
    aggStats.mpregen += stat.mpregen ?? 0;
    aggStats.spellblock += stat.spellblock ?? 0;
    aggStats.abilitypower += stat.abilitypower ?? 0;
    aggStats.abilityhaste += stat.abilityhaste ?? 0;
    aggStats.omnivamp += stat.omnivamp ?? 0;
    aggStats.lifesteal += stat.lifesteal ?? 0;
    aggStats.lethality += stat.lethality ?? 0;
    aggStats.pctarmorpen += stat.pctarmorpen ?? 0;
    aggStats.armorpen += stat.armorpen ?? 0;
    aggStats.magicpen += stat.magicpen ?? 0;
    aggStats.pctmagicpen += stat.pctmagicpen ?? 0;
  });

  return aggStats;
}
