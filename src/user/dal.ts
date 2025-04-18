import { BasicDal } from '../services/database/base.dal';
import { User } from './model';

export class UsersDal extends BasicDal<User> {
    findByUsername = (username: string) => this.model.findOne({ username });
}
