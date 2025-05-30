import { FilterQuery, Model, ObjectId, ProjectionType } from "mongoose";

export class BasicDal<T> {
  constructor(protected readonly model: Model<T>) {}

  create = (data: T) => this.model.create(data);

  findById = (id: string | ObjectId, projection?: ProjectionType<T>) =>
    this.model.findById(id, projection);

  findByIds = (ids: string[]) => this.model.find({ _id: { $in: ids } });
  findAll = () => this.model.find();
  deleteById = (id: string | ObjectId) => this.model.findByIdAndDelete(id);

  updateById = (id: string | ObjectId, data: Partial<T>) =>
    this.model.findByIdAndUpdate(id, data, { new: true });

  deleteMany = (filter: FilterQuery<T>) => this.model.deleteMany(filter);
}
