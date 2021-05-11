import * as firebaseAdmin from 'firebase-admin';
import firebase from 'firebase';
import 'firebase/auth';
import * as yup from 'yup';
import {from} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';
import {validateSchema, ValidationError} from '@core';
import {getDisplayName} from '@auth/helpers';
import type {
  UserService,
  UserWriteRepository,
  UserReadRepository,
  RegisterCommand,
  SignInType,
  UserStatus,
} from '@auth/interfaces';
import {emailExists} from './email-exists';
import {usernameExists} from './username-exists';

const schema = yup.object().shape({
  email: yup.string().required().email(),
  username: yup
    .string()
    .required()
    .matches(
      /^[A-Za-z0-9]{5,20}$/,
      'Username must has minimum 5 and maximum 20 characters, contain only alphanumeric characters',
    ),
  password: yup
    .string()
    .required()
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{5,20}$/,
      'Password must has minimum 5 and maximum 20 characters, at least one uppercase letter, one lowercase letter, one number and one special character',
    ),
  lastName: yup.string().required().max(100),
  firstName: yup.string().required().max(99),
});

const createFirebaseUser = (command: RegisterCommand) =>
  from(
    firebase
      .auth()
      .createUserWithEmailAndPassword(command.email, command.password)
      .then(async (credential) => {
        const accessToken = await credential.user.getIdToken();
        await credential.user.updateProfile({
          displayName: getDisplayName(command),
        });
        return {
          uid: credential.user?.uid,
          refreshToken: credential.user.refreshToken,
          accessToken,
        };
      })
      .then(({uid, accessToken, refreshToken}) =>
        firebaseAdmin
          .auth()
          .createCustomToken(uid)
          .then((loginToken) => ({uid, loginToken, accessToken, refreshToken})),
      )
      .catch(() => {
        throw new ValidationError('An account with this email already exists');
      }),
  );

export const register: (dependencies: {
  userWriteRepository: UserWriteRepository;
  userReadRepository: UserReadRepository;
}) => UserService['register'] = ({userWriteRepository, userReadRepository}) => (command: RegisterCommand) =>
  validateSchema<typeof command>(schema)(command).pipe(
    switchMap((cmd) =>
      emailExists({userReadRepository})({email: command.email}, undefined).pipe(
        map((doesEmailExist) => {
          if (doesEmailExist) {
            throw new ValidationError('An account with this email already exists');
          }
          return cmd;
        }),
      ),
    ),
    switchMap((cmd) =>
      usernameExists({userReadRepository})({username: command.username}, undefined).pipe(
        map((doesUsernameExist) => {
          if (doesUsernameExist) {
            throw new ValidationError('An account with this username already exists');
          }
          return cmd;
        }),
      ),
    ),
    switchMap((cmd) => createFirebaseUser(cmd).pipe(map((tokens) => ({tokens, cmd})))),
    map(({tokens, cmd}) => ({
      tokens,
      user: {
        signInType: 'EMAIL' as SignInType,
        signInId: cmd.email,
        externalId: tokens.uid,
        lastName: cmd.lastName,
        firstName: cmd.firstName,
        displayName: getDisplayName(cmd),
        email: cmd.email,
        avatarUrl: undefined,
        status: 'ACTIVE' as UserStatus,
      },
    })),
    switchMap(({tokens, user}) => userWriteRepository.create(user).pipe(map(() => tokens))),
  );
