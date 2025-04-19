import { Model, ObjectId, ProjectionType } from 'mongoose';

export class BasicDal<T> {
    constructor(protected readonly model: Model<T>) {}

    create = (data: T) => this.model.create(data);

    findById = (id: string | ObjectId, projection?: ProjectionType<T>) =>
        this.model.findById(id, projection);
}
