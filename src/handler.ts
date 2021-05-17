import {ApolloServer} from 'apollo-server-lambda';
import {configureServer} from './server.config';

const {apolloServerConfig} = configureServer();
const server = new ApolloServer(apolloServerConfig);

exports.graphqlHandler = server.createHandler({
  cors: {
    origin: true,
    credentials: true,
  },
});
