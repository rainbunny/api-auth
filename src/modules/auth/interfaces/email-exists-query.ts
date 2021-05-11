import type {Query} from '@core';

export interface EmailExistsQuery extends Query {
  email: string;
}
