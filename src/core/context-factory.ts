/* eslint-disable @typescript-eslint/no-explicit-any */
import * as firebaseAdmin from 'firebase-admin';
import type {AuthUser} from '@tqt/api-core';

export const contextFactory: (deps: {firebaseApp: firebaseAdmin.app.App}) => any =
  ({firebaseApp}) =>
  ({req, event}: any): Promise<{user: AuthUser}> => {
    const authorization = (req || event).headers.authorization || '';
    if (!authorization) {
      return Promise.resolve({user: undefined});
    }
    return firebaseApp
      .auth()
      .verifyIdToken(authorization)
      .then((decodedIdToken) =>
        decodedIdToken.id
          ? {
              user: {
                id: decodedIdToken.id,
                roles: decodedIdToken.roles,
                permissions: decodedIdToken.permissions,
              } as AuthUser,
            }
          : {user: undefined},
      )
      .catch(() => ({user: undefined}));
  };
