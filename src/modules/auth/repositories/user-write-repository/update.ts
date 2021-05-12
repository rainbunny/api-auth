import type {UserWriteRepository} from '@auth/interfaces';
import type {Database} from '@core';

export const update: (dependencies: {database: Database}) => UserWriteRepository['update'] =
  ({database}) =>
  ({id, ...data}) =>
    database.update('app_user')(id, data);
