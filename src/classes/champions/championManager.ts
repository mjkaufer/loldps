import { Champion } from "@/classes/champions/champion";
import { TPatchVersion } from "@/data/constants/patchVersions";

// Handles getting champion for a given version
export class ChampionManager {
  private championClasses: {new(): Champion}[];
  // Should be put in ascending chronological order, w/ newest champ last
  constructor(championClasses: {new(): Champion}[]) {
    this.championClasses = championClasses;

    // TODO: Validate all classes are of same champion, etc.
    if (!championClasses.length) {
      throw new Error("Need at least one champion class, got 0");
    }
  }

  public getChampionClassForVersion(version: TPatchVersion) {
    // TODO: Actually do logic to get overlapping semver from version
    return this.championClasses[this.championClasses.length - 1];
  }
}
