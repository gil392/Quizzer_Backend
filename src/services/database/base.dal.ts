import {
  FilterQuery,
  Model,
  ObjectId,
  ProjectionType,
  RootFilterQuery,
  Types,
} from "mongoose";
import { OmitLeanDocument } from "./types";

export class BasicDal<T extends {}> {
  constructor(protected readonly model: Model<T>) { }

  create = (data: OmitLeanDocument<T> & { _id?: Types.ObjectId | string }) =>
    this.model.create(data);

  findById = (id: string | ObjectId, projection?: ProjectionType<T>) =>
    this.model.findById(id, projection);

  findByIds = (ids: string[]) => this.model.find({ _id: { $in: ids } });

  findAll = () => this.model.find();

  deleteById = (id: string | ObjectId) => this.model.findByIdAndDelete(id);

  updateById = (id: string | ObjectId, data: Partial<T>) =>
    this.model.findByIdAndUpdate(id, data, { new: true });

  deleteMany = (filter: FilterQuery<T>) => this.model.deleteMany(filter);

  insertMany = (data: OmitLeanDocument<T>[] & { _id?: Types.ObjectId | string }) =>
    this.model.insertMany(data);

  find = (filter: RootFilterQuery<T>, projection?: ProjectionType<T>) =>
    this.model.find(filter, projection);
}
