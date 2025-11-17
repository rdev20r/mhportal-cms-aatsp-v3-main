import * as migration_20251116_012055 from './20251116_012055';
import * as migration_20251116_013905 from './20251116_013905';

export const migrations = [
  {
    up: migration_20251116_012055.up,
    down: migration_20251116_012055.down,
    name: '20251116_012055',
  },
  {
    up: migration_20251116_013905.up,
    down: migration_20251116_013905.down,
    name: '20251116_013905'
  },
];
