import { Model, ObjectId } from 'mongoose';

export class BasicDal<T> {
    constructor(protected readonly model: Model<T>) {}

    create = (data: T) => this.model.create(data);
    
    getById = (id: string | ObjectId) => this.model.findById(id);
}
