import { LATEST_PATCH, PATCH_VERSIONS } from '@/data/constants/patchVersions';

import items13_23_1 from './item.13.23.1.json';

export const ITEMS_BY_PATCH: Record<(typeof PATCH_VERSIONS)[number], $FIXME> = {
  '13.23.1': items13_23_1,
}

export const LATEST_ITEMS = ITEMS_BY_PATCH[LATEST_PATCH];