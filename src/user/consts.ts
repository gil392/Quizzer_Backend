import { ProjectionType } from 'mongoose';
import { User } from './model';

export const EXCLUDE_USER_PRIVATE_PROPERTIES_PROJECTION: ProjectionType<User> = {
    hashedPassword: 0,
    refreshToken: 0
};
