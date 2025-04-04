import { Model } from 'mongoose';

export class BasicDal<T> {
    constructor(protected readonly model: Model<T>) {}

    create = (data: T) => this.model.create(data);
}
