import { OmitLeanDocument } from "../../services/database/types";

export type WithStringId<T extends {}> = OmitLeanDocument<T> & { _id: string };
