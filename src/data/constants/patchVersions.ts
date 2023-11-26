
export const PATCH_VERSIONS = [
  '13.23.1',
] as const;

export type TPatchVersion = typeof PATCH_VERSIONS[number];

export const LATEST_PATCH = PATCH_VERSIONS[PATCH_VERSIONS.length - 1];