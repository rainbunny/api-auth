import type {Observable} from 'rxjs';
import type {Context, OffsetQueryResult, Service} from '@core';
import type {GenerateTokenCommand} from './generate-token-command';
import type {RegisterWithTokenCommand} from './register-with-token-command';
import type {User} from './user';

export type UserService = Service<string, User, OffsetQueryResult<string, User>> & {
  registerWithToken: (command: RegisterWithTokenCommand, context: Context) => Observable<void>;
  generateToken: (
    command: GenerateTokenCommand,
    context: Context,
  ) => Observable<{loginToken: string; refreshToken: string; accessToken: string}>;
};
