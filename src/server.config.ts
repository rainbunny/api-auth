import firebase from 'firebase/app';
import {defaults} from 'pg';
import {asValue, AwilixContainer, createContainer, InjectionMode} from 'awilix';
import _ from 'lodash/fp';
import * as firebaseAdmin from 'firebase-admin';
import {RxPool} from '@rainbunny/pg-extensions';
import {baseTypeDefs, baseResolvers, log, updateConfig, contextFactory} from '@core';
import {typeDefs as authTypeDefs} from '@auth/graphql/type-defs';
import {resolvers as authResolvers} from '@auth/graphql/resolvers';
import {bootstrap as bootstrapAuth} from '@auth/bootstrap';
import {version} from '../package.json';

const logPool = (
  message:
    | string
    | {
        queryText: string;
        params: unknown[];
        duration: number;
      },
): void => {
  if (typeof message !== 'string') {
    log.info(message);
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const configureServer = (): {apolloServerConfig: any; container: AwilixContainer} => {
  updateConfig({
    APP_NAME: process.env.APP_NAME || 'Auth Api',
    VERSION: version,
    BUILD: process.env.BUILD || '1',
  });

  // setup database
  defaults.parseInt8 = true;
  const writePool = new RxPool({
    host: process.env.POSTGRES_HOST,
    port: +process.env.POSTGRES_PORT,
    database: process.env.POSTGRES_DB,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    ssl: Boolean(process.env.POSTGRES_SSL),
    log: logPool,
  })
    .on('error', (err) => log.error(err))
    .on('connect', () => log.info('Connected to write database'));

  const readPool = new RxPool({
    host: process.env.REPLICA_POSTGRES_HOST,
    port: +process.env.REPLICA_POSTGRES_PORT,
    database: process.env.REPLICA_POSTGRES_DB,
    user: process.env.REPLICA_POSTGRES_USER,
    password: process.env.REPLICA_POSTGRES_PASSWORD,
    ssl: Boolean(process.env.REPLICA_POSTGRES_SSL),
    log: logPool,
  })
    .on('error', (err) => log.error(err))
    .on('connect', () => log.info('Connected to read database'));

  // setup container
  const container = createContainer({
    injectionMode: InjectionMode.PROXY,
  }).register({
    readDatabase: asValue<RxPool>(readPool),
    writeDatabase: asValue<RxPool>(writePool),
  });
  bootstrapAuth(container);

  // setup Firebase Admin credentials
  const firebaseApp = firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert(JSON.parse(process.env.FIREBASE_CREDENTIAL)),
  });

  // setup Firebase client for auth validation
  firebase.initializeApp(JSON.parse(process.env.FIREBASE_CLIENT_CONFIG));

  return {
    apolloServerConfig: {
      typeDefs: [baseTypeDefs, authTypeDefs],
      resolvers: _.mergeAll([baseResolvers(), authResolvers(container)]),
      playground: Boolean(process.env.ENABLE_GRAPHQL_PLAYGROUND),
      introspection: Boolean(true),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      context: contextFactory({firebaseApp}),
    },
    container,
  };
};
