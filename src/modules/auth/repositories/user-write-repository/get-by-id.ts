import type {User, UserWriteRepository} from '@auth/interfaces';
import type {Database} from '@core';

export const getById: (dependencies: {database: Database}) => UserWriteRepository['getById'] =
  ({database}) =>
  ({id, fields}) =>
    database.getById('app_user')<User, User['id']>(id, Object.keys(fields));
