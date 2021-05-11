import type {ReadRepository} from '@core';
import type {User} from './user';
import type {UserQuery} from './user-query';

export type UserReadRepository = ReadRepository<string, User, UserQuery>;
