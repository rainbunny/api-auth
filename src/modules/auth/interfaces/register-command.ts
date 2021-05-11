import type {Command} from '@core';

export interface RegisterCommand extends Command {
  username: string;
  lastName: string;
  firstName: string;
  email: string;
  password: string;
}
