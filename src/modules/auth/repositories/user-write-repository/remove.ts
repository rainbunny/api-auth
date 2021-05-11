import type {UserWriteRepository} from '@auth/interfaces';
import type {Database} from '@core';

export const remove: (dependencies: {database: Database}) => UserWriteRepository['remove'] = ({database}) => (id) =>
  database.remove('app_user')(id);
