import type {UserWriteRepository} from '@auth/interfaces';
import type {Database} from '@core';

export const create: (dependencies: {database: Database}) => UserWriteRepository['create'] =
  ({database}) =>
  (entity) =>
    database.create('app_user')(entity);
