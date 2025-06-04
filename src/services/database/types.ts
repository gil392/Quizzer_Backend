import { Types } from "mongoose";

export type LeanDocument<DocType extends {}> = DocType & {
  _id: Types.ObjectId;
};

export type OmitLeanDocument<T extends {}> = Omit<T, keyof LeanDocument<{}>>;
