import type {UserReadRepository, UserService} from '@auth/interfaces';
import {map} from 'rxjs/operators';
import _ from 'lodash/fp';

export const emailExists: (dependencies: {userReadRepository: UserReadRepository}) => UserService['emailExists'] = ({
  userReadRepository,
}) => ({email}) =>
  userReadRepository
    .find({
      email,
      fields: {id: {}, externalId: {}, email: {}, signInType: {}},
    })
    .pipe(
      map(_.filter((user) => user.signInType === 'EMAIL' || user.signInType === 'SYSTEM')),
      map((users) => users.length > 0),
    );
