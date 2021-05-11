import type {User, UserQuery, UserReadRepository, UserService} from '@auth/interfaces';

import * as yup from 'yup';
import {SEARCH_TERM_MAX_LENGTH, findOffsetQuery} from '@core';

const querySchema = yup.object().shape({
  searchTerm: yup.string().max(SEARCH_TERM_MAX_LENGTH),
});

export const find: (dependencies: {userReadRepository: UserReadRepository}) => UserService['find'] = ({
  userReadRepository,
}) => (query) => findOffsetQuery<string, User, UserQuery>({query, querySchema, repository: userReadRepository});
