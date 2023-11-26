import { LATEST_PATCH, PATCH_VERSIONS } from '@/data/constants/patchVersions';

import champions13_23_1 from './championFull.13.23.1.json';

export const CHAMPIONS_BY_PATCH: Record<(typeof PATCH_VERSIONS)[number], $FIXME> = {
  '13.23.1': champions13_23_1,
}

export const LATEST_CHAMPIONS = CHAMPIONS_BY_PATCH[LATEST_PATCH];