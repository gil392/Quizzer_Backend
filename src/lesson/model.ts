import { Model, model, Schema } from 'mongoose';

export interface Lesson {
    owner: string;
    sharedUsers: string[];
    videoUrl: string;
    summary: string;
}

const lessonSchema = new Schema<Lesson>({
    owner: { type: String, required: true },
    sharedUsers: { type: [String], default: [] },
    videoUrl: { type: String, required: true },
    summary: { type: String, required: true }
});

export type LessonModel = Model<Lesson>;
export const lessonModel = model('lessons', lessonSchema);
