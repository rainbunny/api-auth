import type {UserWriteRepository} from '@auth/interfaces';
import type {Database} from '@core';

import {getById} from './get-by-id';
import {create} from './create';
import {update} from './update';
import {remove} from './remove';

export const userWriteRepositoryFactory = ({writeDatabase}: {writeDatabase: Database}): UserWriteRepository => ({
  getById: getById({database: writeDatabase}),
  create: create({database: writeDatabase}),
  update: update({database: writeDatabase}),
  remove: remove({database: writeDatabase}),
});
