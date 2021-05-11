import {gql} from 'apollo-server';

export const typeDefs = gql`
  extend type Query {
    users(query: UsersQuery!): UsersQueryResult
    user(query: IdInput!): User
    emailExists(query: EmailExistsQuery!): Boolean
    usernameExists(query: UsernameExistsQuery!): Boolean
  }

  type User {
    id: String
    username: String
    signInType: String
    signInId: String
    externalId: String
    lastName: String
    firstName: String
    displayName: String
    email: String
    avatarUrl: String
    status: String
    createdAt: String
    createdBy: String
    lastModifiedAt: String
    lastModifiedBy: String
  }

  type UsersQueryResult {
    data: [User]
    pagination: OffsetPagination
  }

  input UsersQuery {
    searchTerm: String
    sortBy: [String!]
    pageIndex: Int
    rowsPerPage: Int
  }

  input EmailExistsQuery {
    email: String!
  }

  input UsernameExistsQuery {
    username: String!
  }

  extend type Mutation {
    users: UserOperations
  }

  type UserOperations {
    registerWithToken(payload: RegisterWithTokenCommand!): String
    generateToken(payload: GenerateTokenCommand!): GenerateLoginTokenResult
    register(payload: RegisterCommand!): RegisterResult
  }

  type GenerateLoginTokenResult {
    loginToken: String
    refreshToken: String
    accessToken: String
  }

  type RegisterResult {
    loginToken: String
    refreshToken: String
    accessToken: String
  }

  input RegisterWithTokenCommand {
    token: String!
  }

  input GenerateTokenCommand {
    usernameOrEmail: String!
    password: String!
  }

  input RegisterCommand {
    username: String!
    lastName: String!
    firstName: String!
    email: String!
    password: String!
  }
`;
