import express from 'express';
import helmet from 'helmet';
import {ApolloServer} from 'apollo-server-express';
import {configureServer} from './server.config';

const {apolloServerConfig} = configureServer();
const port = process.env.PORT || 3000;
const server = express();
server.use(helmet());
const apolloServer = new ApolloServer(apolloServerConfig);
apolloServer.applyMiddleware({app: server});
server.listen({port}, () =>
  // eslint-disable-next-line no-console
  console.log(`🚀 Server ready at http://localhost:${port}${apolloServer.graphqlPath}`),
);
