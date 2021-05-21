import {ValidationError} from 'apollo-server';
import * as yup from 'yup';
import * as firebaseAdmin from 'firebase-admin';
import {validateSchema} from '@core';
import {from, of} from 'rxjs';
import {catchError, switchMap} from 'rxjs/operators';
import type {UserService, UserWriteRepository, RegisterWithTokenCommand, SignInType, User} from '@auth/interfaces';

const INVALID_CREDENTIAL_MESSAGE = 'Invalid credential';

const schema = yup.object().shape({
  token: yup.string().required(),
});

const convertToUser = (user: firebaseAdmin.auth.UserRecord): Omit<User, 'id'> => {
  let avatarUrl = user.photoURL || '';
  let signInType: SignInType = 'EMAIL';
  let {email, displayName} = user;
  if (user.providerData[0].providerId === 'facebook.com') {
    signInType = 'FACEBOOK';
    avatarUrl = `${avatarUrl}?type=large`;
  } else if (user.providerData[0].providerId === 'google.com') {
    signInType = 'GOOGLE';
    avatarUrl = avatarUrl.replace('s96-c', 's400-c');
  } else if (user.providerData[0].providerId === 'apple.com') {
    signInType = 'APPLE';
    displayName = displayName || user.providerData[0].email;
  } else if (user.providerData[0].providerId === 'phone') {
    signInType = 'PHONE_NO';
    displayName = displayName || user.providerData[0].phoneNumber;
  } else {
    displayName = displayName || user.providerData[0].email;
  }
  email = email || user.providerData[0].email;
  return {
    signInType,
    signInId: user.providerData[0].uid,
    externalId: user.uid,
    lastName: displayName,
    firstName: undefined,
    displayName,
    email,
    avatarUrl,
    status: user.disabled ? 'DISABLED' : 'ACTIVE',
  };
};

const createUser = (userData: firebaseAdmin.auth.DecodedIdToken, userWriteRepository: UserWriteRepository) =>
  from(
    firebaseAdmin
      .auth()
      .getUser(userData.uid)
      .then(convertToUser)
      .then(userWriteRepository.create)
      .then((id) => firebaseAdmin.auth().setCustomUserClaims(userData.uid, {id})),
  );

export const registerWithToken: (dependencies: {
  userWriteRepository: UserWriteRepository;
}) => UserService['registerWithToken'] =
  ({userWriteRepository}) =>
  (command: RegisterWithTokenCommand) =>
    validateSchema<RegisterWithTokenCommand>(schema)(command).pipe(
      switchMap(({token}) => from(firebaseAdmin.auth().verifyIdToken(token))),
      catchError(() => {
        throw new ValidationError(INVALID_CREDENTIAL_MESSAGE);
      }),
      switchMap((userData) => (userData.id ? of<void>() : createUser(userData, userWriteRepository))),
    );
