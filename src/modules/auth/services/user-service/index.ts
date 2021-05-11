import type {UserReadRepository, UserService, UserWriteRepository} from '@auth/interfaces';

import {find} from './find';
import {getById} from './get-by-id';
import {generateToken} from './generate-token';
import {registerWithToken} from './register-with-token';

export const userServiceFactory = ({
  userReadRepository,
  userWriteRepository,
}: {
  userReadRepository: UserReadRepository;
  userWriteRepository: UserWriteRepository;
}): UserService => ({
  find: find({userReadRepository}),
  getById: getById({userReadRepository}),
  registerWithToken: registerWithToken({userWriteRepository}),
  generateToken: generateToken({userReadRepository, userWriteRepository}),
});
