import { BasicDal } from '../services/database/base.dal';
import { EXLUDE_USER_PRIVATE_PROPERTIES_PROJECTION } from './consts';
import { User } from './model';

export class UsersDal extends BasicDal<User> {
    findByUsername = (username: string) => this.model.findOne({ username });

    findPublicUserById = (id: string) =>
        this.findById(id, EXLUDE_USER_PRIVATE_PROPERTIES_PROJECTION);
}
