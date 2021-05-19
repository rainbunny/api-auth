import {getEntityById} from '@core';
import type {UserReadRepository, UserService} from '@auth/interfaces';

export const getById: (dependencies: {userReadRepository: UserReadRepository}) => UserService['getById'] =
  ({userReadRepository}) =>
  (query) =>
    getEntityById({query, repository: userReadRepository});
