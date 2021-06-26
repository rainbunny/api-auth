import * as yup from 'yup';
import {SEARCH_TERM_MAX_LENGTH, findOffsetQuery} from '@core';
import type {User, UserQuery, UserReadRepository, UserService} from '@auth/interfaces';

const querySchema = yup.object().shape({
  searchTerm: yup.string().max(SEARCH_TERM_MAX_LENGTH),
});

export const find: (dependencies: {userReadRepository: UserReadRepository}) => UserService['find'] =
  ({userReadRepository}) =>
  (query) =>
    findOffsetQuery<string, User, UserQuery>({
      query: {...query, fields: query.fields.data},
      querySchema,
      repository: userReadRepository,
    });
