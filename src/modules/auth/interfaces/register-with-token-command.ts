import type {Command} from '@core';

export interface RegisterWithTokenCommand extends Command {
  token: string;
}
