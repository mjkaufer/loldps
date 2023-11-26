import { LATEST_PATCH, PATCH_VERSIONS, TPatchVersion } from "@/data/constants/patchVersions";

export class Champion {
  private startVersion: TPatchVersion;
  private endVersion: TPatchVersion;

  constructor() {
    this.startVersion = PATCH_VERSIONS[0];
    this.endVersion = LATEST_PATCH;
  }
}