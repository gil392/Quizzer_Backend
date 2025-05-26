import { Types } from "mongoose";

export type LeanDocument<DocType> = DocType & {
  _id: Types.ObjectId;
};
