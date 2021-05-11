import {Command} from '@core';

export interface GenerateTokenCommand extends Command {
  usernameOrEmail: string;
  password: string;
}
