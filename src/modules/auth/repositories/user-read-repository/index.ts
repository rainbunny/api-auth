import type {UserReadRepository} from '@auth/interfaces';
import type {Database} from '@core';

import {find} from './find';
import {getById} from './get-by-id';
import {count} from './count';

export const userReadRepositoryFactory = ({readDatabase}: {readDatabase: Database}): UserReadRepository => ({
  getById: getById({database: readDatabase}),
  find: find({database: readDatabase}),
  count: count({database: readDatabase}),
});
