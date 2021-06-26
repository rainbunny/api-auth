import _ from 'lodash/fp';
import type {UserReadRepository, UserService} from '@auth/interfaces';

export const emailExists: (dependencies: {userReadRepository: UserReadRepository}) => UserService['emailExists'] =
  ({userReadRepository}) =>
  ({email}) =>
    userReadRepository
      .find({
        email,
        fields: {id: {}, externalId: {}, email: {}, signInType: {}},
      })
      .then(_.filter((user) => user.signInType === 'EMAIL' || user.signInType === 'SYSTEM'))
      .then((users) => users.length > 0);
