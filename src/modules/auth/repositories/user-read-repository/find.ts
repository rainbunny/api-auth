import {convertSearchTerm} from '@core';
import type {User, UserReadRepository, UserQuery} from '@auth/interfaces';
import type {Database} from '@core';

export const buildWhereClause = (filters: {searchTerm: string; username: string; email: string}): string => {
  let whereClause = '';
  if (filters.searchTerm) {
    whereClause += 'tsv @@ to_tsquery(:searchTerm)';
  }
  if (filters.email) {
    whereClause += 'email = :email';
  }
  if (filters.username) {
    whereClause += 'username = :username';
  }
  return whereClause;
};

export const find: (dependencies: {database: Database}) => UserReadRepository['find'] =
  ({database}) =>
  ({searchTerm, username, email, fields, ...other}: UserQuery) =>
    database.executeQuery<User>({
      table: 'app_user',
      whereClause: buildWhereClause({searchTerm, username, email}),
      params: {
        searchTerm: convertSearchTerm(searchTerm),
        username,
        email,
      },
      fields: Object.keys(fields.data),
      ...other,
    });
