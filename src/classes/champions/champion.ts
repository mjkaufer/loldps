import { LATEST_PATCH, PATCH_VERSIONS, TPatchVersion } from "@/data/constants/patchVersions";

export class Champion {
  // These should be set on champion def if a champ gets reworked, so we can
  // validate if a given champ invoked is being run on a valid version / filter
  // champs out of their versions
  static readonly startVersion: TPatchVersion = PATCH_VERSIONS[0];
  static readonly endVersion: TPatchVersion = LATEST_PATCH;
  
  protected championName: string;
  protected version: TPatchVersion;

  constructor(championName: string, version: TPatchVersion) {
    this.championName = championName;
    this.version = version;
    // TODO: Validate version is between start/end when we get semver code
  }


}