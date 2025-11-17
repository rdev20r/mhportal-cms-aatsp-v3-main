import * as migration_20251117_022505 from './20251117_022505';

export const migrations = [
  {
    up: migration_20251117_022505.up,
    down: migration_20251117_022505.down,
    name: '20251117_022505'
  },
];
