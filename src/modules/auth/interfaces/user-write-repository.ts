import type {WriteRepository} from '@core';
import type {User} from './user';

export type UserWriteRepository = WriteRepository<string, User>;
