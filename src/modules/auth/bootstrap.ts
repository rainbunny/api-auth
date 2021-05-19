import {asFunction} from 'awilix';
import type {AwilixContainer} from 'awilix';
import {userReadRepositoryFactory, userWriteRepositoryFactory} from './repositories';
import {userServiceFactory} from './services';

export const bootstrap = (container: AwilixContainer): void => {
  container.register({
    userReadRepository: asFunction(userReadRepositoryFactory).singleton(),
    userWriteRepository: asFunction(userWriteRepositoryFactory).singleton(),
    userService: asFunction(userServiceFactory).singleton(),
  });
};
