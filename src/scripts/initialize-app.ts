import * as firebaseAdmin from 'firebase-admin';
import {from} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';
import {log} from '@core';
import type {User} from '@auth/interfaces';
import type {Database} from '@core';
import type {Observable} from 'rxjs';
import {configureServer} from '../server.config';

const getAdminUser = (database: Database): Observable<User> =>
  database
    .executeQuery<User>({
      table: 'app_user',
      whereClause: "username = 'admin'",
      fields: ['id', 'username', 'email', 'displayName', 'externalId'],
    })
    .pipe(map((users) => users[0]));

const setThenGetFirebaseAdminUser = async (
  adminCredentials: {email: string; password: string},
  admin: User,
): Promise<{admin: User; firebaseUser: firebaseAdmin.auth.UserRecord}> => {
  let firebaseUser: firebaseAdmin.auth.UserRecord;
  try {
    firebaseUser = await firebaseAdmin.auth().getUserByEmail(adminCredentials.email);
  } catch {
    // do nothing
  }
  if (!firebaseUser) {
    await firebaseAdmin.auth().createUser({
      email: adminCredentials.email,
      emailVerified: true,
      password: adminCredentials.password,
      displayName: admin.displayName,
    });
    log.info('Created Firebase user for admin');
    firebaseUser = await firebaseAdmin.auth().getUserByEmail(adminCredentials.email);
  } else {
    log.info(`Use the existing Firebase user ${firebaseUser.uid}`);
  }
  return {
    admin,
    firebaseUser,
  };
};

export const execute = (): void => {
  const adminCredentials: {email: string; password: string} = {
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
  };
  const {container} = configureServer();
  const database = container.resolve<Database>('writeDatabase');

  getAdminUser(database)
    .pipe(
      switchMap((admin) => from(setThenGetFirebaseAdminUser(adminCredentials, admin))),
      switchMap(({admin, firebaseUser}) =>
        // update firebase credentials
        database
          .update('app_user')(admin.id, {
            externalId: firebaseUser.uid,
            signInId: adminCredentials.email,
            email: adminCredentials.email,
          })
          .pipe(map(() => ({admin, firebaseUser}))),
      ),
      switchMap(({admin, firebaseUser}) =>
        // update firebase claim
        from(firebaseAdmin.auth().setCustomUserClaims(firebaseUser.uid, {id: admin.id})),
      ),
    )
    .subscribe({
      complete: () => {
        log.info('Initialized admin user');
      },
      error: (e) => log.error(e),
    });
};
