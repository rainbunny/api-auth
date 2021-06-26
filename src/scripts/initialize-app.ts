import * as firebaseAdmin from 'firebase-admin';
import {log} from '@core';
import type {User} from '@auth/interfaces';
import type {Database} from '@core';
import {configureServer} from '../server.config';

const getAdminUser = (database: Database): Promise<User> =>
  database
    .executeQuery<User>({
      table: 'app_user',
      whereClause: "username = 'admin'",
      fields: ['id', 'username', 'email', 'displayName', 'externalId'],
    })
    .then((users) => users[0]);

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
    .then((admin) => setThenGetFirebaseAdminUser(adminCredentials, admin))
    .then(({admin, firebaseUser}) =>
      // update firebase credentials
      database
        .update('app_user')(admin.id, {
          externalId: firebaseUser.uid,
          signInId: adminCredentials.email,
          email: adminCredentials.email,
        })
        .then(() => firebaseAdmin.auth().setCustomUserClaims(firebaseUser.uid, {id: admin.id})),
    )
    .catch((e) => log.error(e))
    .then(() => {
      log.info('Initialized admin user');
    });
};
