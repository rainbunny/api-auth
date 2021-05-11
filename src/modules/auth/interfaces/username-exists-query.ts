import type {Query} from '@core';

export interface UsernameExistsQuery extends Query {
  username: string;
}
