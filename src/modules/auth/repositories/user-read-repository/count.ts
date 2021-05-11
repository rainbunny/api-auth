import type {UserQuery, UserReadRepository} from '@auth/interfaces';
import type {Database} from '@core';

import {convertSearchTerm} from '@core';
import {buildWhereClause} from './find';

export const count: (dependencies: {database: Database}) => UserReadRepository['count'] = ({database}) => ({
  searchTerm,
  username,
  email,
  fields,
  ...other
}: UserQuery) =>
  database.count({
    table: 'app_user',
    whereClause: buildWhereClause({searchTerm, username, email}),
    params: {
      searchTerm: convertSearchTerm(searchTerm),
      username,
      email,
    },
    fields: Object.keys(fields),
    ...other,
  });
