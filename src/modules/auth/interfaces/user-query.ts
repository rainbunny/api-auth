import type {OffsetQuery} from '@core';

export interface UserQuery extends OffsetQuery {
  searchTerm?: string;
  email?: string;
  username?: string;
}
