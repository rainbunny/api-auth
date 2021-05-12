import type {User, UserReadRepository} from '@auth/interfaces';
import type {Database} from '@core';

export const getById: (dependencies: {database: Database}) => UserReadRepository['getById'] =
  ({database}) =>
  ({id, fields}) =>
    database.getById('app_user')<User, User['id']>(id, Object.keys(fields));
