import { validateAuthenticatedRequest } from '../authentication/validators';
import { NotFoundError } from '../services/server/exceptions';
import { UsersDal } from './dal';

export const getLoggedUser = (usersDal: UsersDal) =>
    validateAuthenticatedRequest(async (request, response) => {
        const { id: userId } = request.user;
        const user = await usersDal.findPublicUserById(userId).lean();
        if (!user) {
            throw new NotFoundError('user not found');
        }
        response.json(user);
    });
