import _ from "lodash";
import { findAndUpsertStatuses } from "@/classes/champions/statusUtils";
import { getFractionalStats } from "@/classes/champions/statUtils";
import {
  ChampStatusName,
  TChampionStats,
  TEventContextWithTarget,
  TSkillCastContextWithTarget,
  TSkillDefinition,
} from "@/classes/champions/types";
import { Champion } from "../../champion";

const PASSIVE_TICK_MS = 1000;
const PASSIVE_EXPIRATION_MS = 4 * 1000;
const ULT_EXPIRATION_MS = 7 * 1000;
const PASSIVE_MAX_STACKS = 3;

const MORD_ULT_STEAL_STATS: (keyof TChampionStats)[] = [
  "abilitypower",
  "attackdamage",
  "attackspeed",
  "hp",
  "armor",
  "spellblock",
];

// TODO: Support composition so we can add CC for E, etc.
const applyMordPassive = (context: TSkillCastContextWithTarget<Mordekaiser>) =>
  findAndUpsertStatuses(
    context.championStatuses,
    ChampStatusName.MordPassive,
    (s) => {
      const stacks = Math.max((s?.stacks ?? 0) + 1, PASSIVE_MAX_STACKS);
      const isActive = stacks === PASSIVE_MAX_STACKS;
      const priorNextFireTime = s?.fireAtMs ?? 0;
      // If we have an existing event which hasn't fired yet, use its next fire time, otherwise we delay perpetually
      const nextFireAtMs =
        priorNextFireTime > context.currentTickMs
          ? priorNextFireTime
          : context.currentTickMs + PASSIVE_TICK_MS;
      return {
        stackExpiryMs: context.currentTickMs + PASSIVE_EXPIRATION_MS,
        status: ChampStatusName.MordPassive,
        stacks,
        expiresAtMs: null,
        registeredAtMs: context.currentTickMs,
        getDamage: (context, self) => {
          if ((self.stacks ?? 0) === PASSIVE_MAX_STACKS) {
            return Mordekaiser.getPassiveDamage(context);
          }
          return undefined;
        },
        fireAtMs: isActive ? nextFireAtMs : null,
        isDamageProc: true,
        isStackable: true,
        removeOnProcess: false,
      };
    }
  );

const applyUltSelf = (context: TSkillCastContextWithTarget<Mordekaiser>) =>
  findAndUpsertStatuses(
    context.targetStatuses,
    ChampStatusName.MordUltSelf,
    (s) => ({
      status: ChampStatusName.MordUltSelf,
      expiresAtMs: context.currentTickMs + ULT_EXPIRATION_MS,
      stats: _.pick(
        getFractionalStats(context.targetChampion.getStats(), 0.1),
        MORD_ULT_STEAL_STATS
      ),
      registeredAtMs: context.currentTickMs,
      isStatMod: true,
      removeOnProcess: false,
    })
  );

const applyUltTarget = (context: TSkillCastContextWithTarget<Mordekaiser>) =>
  findAndUpsertStatuses(
    context.targetStatuses,
    ChampStatusName.MordUltTarget,
    (s) => ({
      status: ChampStatusName.MordUltTarget,
      expiresAtMs: context.currentTickMs + ULT_EXPIRATION_MS,
      stats: _.pick(
        getFractionalStats(context.targetChampion.getStats(), -0.1),
        MORD_ULT_STEAL_STATS
      ),
      registeredAtMs: context.currentTickMs,
      isStatMod: true,
      removeOnProcess: false,
    })
  );

export class Mordekaiser extends Champion {
  static readonly enabled: boolean = true;
  public static readonly skillDefinition: TSkillDefinition<Mordekaiser> = {
    A: Object.assign(
      {
        updateSelfStatuses: applyMordPassive,
      },
      Champion.skillDefinition.A
    ),
    P: Champion.skillDefinition.P,
    Q: {
      cooldownByLevel: [9, 7.75, 6.5, 5.25, 4],
      updateSelfStatuses: applyMordPassive,
      getPreDamage: (c) => {
        return {
          magic:
            ([
              5, 9, 13, 17, 21, 25, 29, 33, 37, 41, 51, 61, 71, 81, 91, 107,
              123, 139,
            ][c.champion.level] +
            [75, 95, 115, 135, 155][c.skillLevel] + 
              c.champStats.abilitypower * 0.6) *
            [0.4, 0.45, 0.5, 0.55, 0.6][c.skillLevel],
        };
      },
    },

    // Not really relevant for DPS sim
    W: { cooldownByLevel: null },

    E: {
      cooldownByLevel: [18, 16, 14, 12, 10],
      getPassiveStatMod: (c) => ({
        pctmagicpen: [0, 5, 7.5, 10, 12.5, 15][c.skillLevel],
      }),
      getPreDamage: (c) => {
        return {
          magic:
            [80, 95, 110, 125, 140][c.skillLevel] +
            c.champStats.abilitypower * 0.6,
        };
      },
      updateSelfStatuses: applyMordPassive,
    },
    R: {
      cooldownByLevel: [140, 120, 100],
      updateSelfStatuses: applyUltSelf,
      updateTargetStatuses: applyUltTarget,
    },
  };

  constructor() {
    super("Mordekaiser");
  }

  static getPassiveDamage = (
    damageCallbackContext: TEventContextWithTarget<Mordekaiser>
  ) => {
    return {
      magic:
        4.4 +
        0.6 * damageCallbackContext.champion.level +
        0.3 * damageCallbackContext.champStats.abilitypower +
        // TODO: Maybe provide stats in context, so we don't compute a whole bunch
        ((1 + 4 / 17) / 100) *
          damageCallbackContext.targetChampion.getStats().hp,
    };
  };
}
