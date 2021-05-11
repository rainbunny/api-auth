import type {IResolvers} from 'apollo-server';
import type {ApolloServerExpressConfig} from 'apollo-server-express';

import firebase from 'firebase/app';
import {defaults} from 'pg';
import {asValue, AwilixContainer, createContainer, InjectionMode} from 'awilix';
import _ from 'lodash/fp';
import * as firebaseAdmin from 'firebase-admin';
import {RxPool} from '@rainbunny/pg-extensions';
import {baseTypeDefs, baseResolvers, log, contextFactory, updateConfig} from '@core';
import {typeDefs as authTypeDefs} from '@auth/graphql/type-defs';
import {resolvers as authResolvers} from '@auth/graphql/resolvers';
import {bootstrap as bootstrapAuth} from '@auth/bootstrap';
import {version} from '../package.json';

export const configureServer = (): {apolloServerConfig: ApolloServerExpressConfig; container: AwilixContainer} => {
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
    log: (message) => {
      if (typeof message !== 'string') {
        log.info(message);
      }
    },
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
    log: (message) => {
      if (typeof message !== 'string') {
        log.info(message);
      }
    },
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
      resolvers: (_.mergeAll([baseResolvers(), authResolvers(container)]) as unknown) as IResolvers,
      playground: Boolean(true),
      introspection: Boolean(true),
      context: contextFactory({firebaseApp}),
    },
    container,
  };
};
