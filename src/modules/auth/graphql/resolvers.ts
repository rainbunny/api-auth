import {convertHandlersToResolvers} from '@core';
import type {Resolver} from '@core';
import type {UserService} from '@auth/interfaces';
import type {AwilixContainer} from 'awilix';

export const resolvers = (container: AwilixContainer): Resolver =>
  convertHandlersToResolvers({
    Query: {
      users: container.resolve<UserService>('userService').find,
      user: container.resolve<UserService>('userService').getById,
      emailExists: container.resolve<UserService>('userService').emailExists,
      usernameExists: container.resolve<UserService>('userService').usernameExists,
    },
    Mutation: {
      users: {
        registerWithToken: container.resolve<UserService>('userService').registerWithToken,
        generateToken: container.resolve<UserService>('userService').generateToken,
        register: container.resolve<UserService>('userService').register,
      },
    },
  });
