import { LATEST_PATCH, PATCH_VERSIONS, TPatchVersion } from "@/data/constants/patchVersions";

export class Champion {
  private startVersion: TPatchVersion;
  private endVersion: TPatchVersion;
  private championName: string;

  constructor(championName: string) {
    this.championName = championName;
    this.startVersion = PATCH_VERSIONS[0];
    this.endVersion = LATEST_PATCH;
  }

  
}