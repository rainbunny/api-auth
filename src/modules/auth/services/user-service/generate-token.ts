import {ValidationError} from 'apollo-server-core';
import {filter} from 'lodash/fp';
import * as firebaseAdmin from 'firebase-admin';
import firebase from 'firebase';
import 'firebase/auth';
import * as yup from 'yup';
import {validateSchema} from '@core';
import type {UserService, UserWriteRepository, GenerateTokenCommand, User, UserReadRepository} from '@auth/interfaces';

const schema = yup.object().shape({
  usernameOrEmail: yup.string().required(),
  password: yup.string().required(),
});

const INVALID_CREDENTIAL_MESSAGE = 'Invalid credential';

const getUserFromDatabase =
  (repository: UserReadRepository) =>
  (command: GenerateTokenCommand): Promise<User> =>
    repository
      .find({
        email: command.usernameOrEmail.includes('@') ? command.usernameOrEmail : undefined,
        username: !command.usernameOrEmail.includes('@') ? command.usernameOrEmail : undefined,
        fields: {id: {}, externalId: {}, email: {}, signInType: {}},
      })
      .then(filter((user) => user.signInType === 'EMAIL' || user.signInType === 'SYSTEM'))
      .then((users) => {
        if (users.length === 0) {
          throw new ValidationError(INVALID_CREDENTIAL_MESSAGE);
        }
        return users[0];
      });

const validateCredential = (email: string, password: string) =>
  firebase
    .auth()
    .signInWithEmailAndPassword(email, password)
    .then(async (credential) => {
      const accessToken = await credential.user.getIdToken();
      return {
        uid: credential.user?.uid,
        refreshToken: credential.user.refreshToken,
        accessToken,
      };
    })
    .catch(() => {
      throw new ValidationError(INVALID_CREDENTIAL_MESSAGE);
    });

export const generateToken: (dependencies: {
  userWriteRepository: UserWriteRepository;
  userReadRepository: UserReadRepository;
}) => UserService['generateToken'] =
  ({userReadRepository}) =>
  (command: GenerateTokenCommand) =>
    validateSchema<typeof command>(schema)(command)
      .then(getUserFromDatabase(userReadRepository))
      .then((user) => validateCredential(user.email || '', command.password))
      .then(({uid, accessToken, refreshToken}) =>
        firebaseAdmin
          .auth()
          .createCustomToken(uid)
          .then((loginToken) => ({loginToken, accessToken, refreshToken})),
      );
