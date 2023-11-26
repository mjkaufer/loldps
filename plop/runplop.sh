#!/bin/bash
# See https://github.com/plopjs/plop/issues/297#issuecomment-1704928090
export TS_NODE_PROJECT=plop/tsconfig.plop.json;
export NODE_OPTIONS="--loader ts-node/esm --no-warnings";
pnpm plop --plopfile plop/plopfile.ts "$@"