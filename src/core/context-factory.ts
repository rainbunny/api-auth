/* eslint-disable @typescript-eslint/no-explicit-any */
import type {AuthUser} from '@rainbunny/api-core';
import * as firebaseAdmin from 'firebase-admin';

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
