import _ from "lodash";
import {
  ChampStatusName,
  ChampStatus,
  ChampStatusMap,
} from "@/classes/champions/types";

export function findAndUpsertStatuses<
  C extends ChampStatusName = ChampStatusName
>(
  statusMap: ChampStatusMap,
  // If you pass match as status name, you get better typing here
  // Also can only upsert with fixed match, otherwise we don't know what we're inserting
  match: C | ((s: ChampStatus) => boolean),
  // TODO: Better support for multi-status update?
  updateStatus: (
    matchingStatus: ChampStatus<C> | undefined
  ) => ChampStatus<C> | undefined
): ChampStatusMap {
  const matchFn = _.isFunction(match)
    ? match
    : (s: ChampStatus) => s.status === match;

  let foundMatch = false;
  (_.keys(statusMap) as ChampStatusName[]).forEach((champStatusName) => {
    const champStatuses = statusMap[champStatusName];

    if (champStatuses) {
      // TS gets super angry w/ generics here, so have to do some casting :(
      const filteredChampStatuses = (
        champStatuses.map((s: ChampStatus) => {
          if (matchFn(s)) {
            foundMatch = true;
            return updateStatus(s as $FIXME);
          } else {
            return s;
          }
        }) as (ChampStatus | undefined)[]
      ).filter((c): c is ChampStatus => !!c);

      // Unsure why TS is flipping out about undefined here
      // Hacky cast to shut it up :(
      statusMap[champStatusName] = filteredChampStatuses as $FIXME;
      foundMatch = true;
    }
  });

  // Can only upsert
  if (!foundMatch && typeof match === "string") {
    const nextStatus = updateStatus(undefined);
    if (nextStatus) {
      statusMap[match] = statusMap[match] || [];
      statusMap[match]!.push(nextStatus);
    }
    foundMatch = true;
  }

  return statusMap;
}
