import type {UserReadRepository, UserService} from '@auth/interfaces';
import {map} from 'rxjs/operators';

export const usernameExists: (dependencies: {userReadRepository: UserReadRepository}) => UserService['usernameExists'] =

    ({userReadRepository}) =>
    ({username}) =>
      userReadRepository
        .find({
          username,
          fields: {id: {}, externalId: {}, username: {}, signInType: {}},
        })
        .pipe(map((users) => users.length > 0));
