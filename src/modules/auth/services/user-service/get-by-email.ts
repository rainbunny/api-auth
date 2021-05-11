import type {UserReadRepository, UserService} from '@auth/interfaces';

import {getEntityById} from '@core';

export const getByEmail: (dependencies: {userReadRepository: UserReadRepository}) => UserService['getById'] = ({
  userReadRepository,
}) => (query) => getEntityById({query, repository: userReadRepository});
