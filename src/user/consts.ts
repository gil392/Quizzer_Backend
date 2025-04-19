import { ProjectionType } from 'mongoose';
import { User } from './model';

export const EXLUDE_USER_PRIVATE_PROPERTIES_PROJECTION: ProjectionType<User> = {
    hashedPassword: 0,
    refreshToken: 0
};
