/* eslint-disable @typescript-eslint/no-explicit-any */
import {contextFactory} from '@core';

const authWithError = () => ({
  verifyIdToken: async () => {
    throw new Error();
  },
});

describe('contextFactory', () => {
  it('returns context correctly', async () => {
    const user = {
      id: 'id',
      roles: ['admin'],
      permissions: ['createUser'],
    };
    const dependencies = {
      firebaseApp: {
        auth: () => ({
          verifyIdToken: async () => user,
        }),
      },
    };
    const context = await contextFactory(dependencies as any)({req: {headers: {authorization: 'token'}}});
    expect(context).toMatchInlineSnapshot(`
      Object {
        "user": Object {
          "id": "id",
          "permissions": Array [
            "createUser",
          ],
          "roles": Array [
            "admin",
          ],
        },
      }
    `);
  });

  it('returns context correctly with event', async () => {
    const user = {
      id: 'id',
      roles: ['admin'],
      permissions: ['createUser'],
    };
    const dependencies = {
      firebaseApp: {
        auth: () => ({
          verifyIdToken: async () => user,
        }),
      },
    };
    const context = await contextFactory(dependencies as any)({event: {headers: {authorization: 'token'}}});
    expect(context).toMatchInlineSnapshot(`
      Object {
        "user": Object {
          "id": "id",
          "permissions": Array [
            "createUser",
          ],
          "roles": Array [
            "admin",
          ],
        },
      }
    `);
  });

  it('returns context with no user', async () => {
    const dependencies = {
      firebaseApp: {
        auth: () => ({
          verifyIdToken: async () => ({}),
        }),
      },
    };
    const context = await contextFactory(dependencies as any)({req: {headers: {authorization: 'token'}}});
    expect(context).toMatchInlineSnapshot(`
      Object {
        "user": undefined,
      }
    `);
  });

  it('returns context with no user if decoding not successfully', async () => {
    const dependencies = {
      firebaseApp: {
        auth: authWithError,
      },
    };
    const context = await contextFactory(dependencies as any)({req: {headers: {authorization: 'token'}}});
    expect(context).toMatchInlineSnapshot(`
      Object {
        "user": undefined,
      }
    `);
  });

  it('returns context with no user if there is no token', async () => {
    const dependencies = {
      firebaseApp: {
        auth: authWithError,
      },
    };
    const context = await contextFactory(dependencies as any)({req: {headers: {authorization: ''}}});
    expect(context).toMatchInlineSnapshot(`
      Object {
        "user": undefined,
      }
    `);
  });
});

export {};
