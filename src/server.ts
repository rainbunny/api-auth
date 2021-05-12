import express from 'express';
import helmet from 'helmet';
import {ApolloServer} from 'apollo-server-express';
import {log} from '@core';
import {configureServer} from './server.config';

const {apolloServerConfig} = configureServer();
const port = process.env.PORT || 3000;
const server = express().use(
  helmet({contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false}),
);
const apolloServer = new ApolloServer(apolloServerConfig);
apolloServer.applyMiddleware({app: server});
server.listen({port}, () =>
  // eslint-disable-next-line no-console
  log.info(`🚀 Server ready at http://localhost:${port}${apolloServer.graphqlPath}`),
);
