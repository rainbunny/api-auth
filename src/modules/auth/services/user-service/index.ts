import type {UserReadRepository, UserService, UserWriteRepository} from '@auth/interfaces';

import {find} from './find';
import {getById} from './get-by-id';
import {generateToken} from './generate-token';
import {registerWithToken} from './register-with-token';
import {emailExists} from './email-exists';
import {usernameExists} from './username-exists';
import {register} from './register';

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
  register: register({userReadRepository, userWriteRepository}),
  emailExists: emailExists({userReadRepository}),
  usernameExists: usernameExists({userReadRepository}),
});
