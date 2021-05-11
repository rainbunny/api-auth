import type {Entity} from '@core';

export type SignInType = 'SYSTEM' | 'EMAIL' | 'GOOGLE' | 'FACEBOOK' | 'APPLE' | 'PHONE_NO';
export type UserStatus = 'ACTIVE' | 'DISABLED';
export interface User extends Entity {
  username?: string;
  signInType: SignInType;
  signInId: string;
  externalId: string;
  lastName: string;
  firstName?: string;
  displayName: string;
  email?: string;
  avatarUrl?: string;
  status: UserStatus;
  /** unix timestamp */
  createdAt?: string;
  createdBy?: string;
  /** unix timestamp */
  lastModifiedAt?: string;
  lastModifiedBy?: string;
}
