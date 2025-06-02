import { RootFilterQuery } from "mongoose";
import { keys, mapObjIndexed, values as ramdaValues } from "ramda";
import { LessonsDal } from "../../lesson/dal";
import { Lesson } from "../../lesson/model";
import { User } from "../../user/model";
import {
  LessonRequirement,
  RequirementProgress,
  UserRequirement,
} from "../types";

const createIsFieldGreaterThanOrEqualQuery = (
  value: number,
  field: string
) => ({
  $expr: {
    $gte: [
      {
        $cond: [
          { $eq: [{ $type: `$${field}` }, "array"] },
          { $size: `$${field}` },
          {
            $cond: [
              { $eq: [{ $type: `$${field}` }, "number"] },
              `$${field}`,
              -Infinity,
            ],
          },
        ],
      },
      value,
    ],
  },
});

export const createMongooseFindQueryToRequirementCondition = <
  T extends {} = {}
>(
  conditionValues: Record<string, number>
): RootFilterQuery<T> => ({
  $and: ramdaValues(
    mapObjIndexed(
      (value, field) => createIsFieldGreaterThanOrEqualQuery(value, field),
      conditionValues
    )
  ),
});

const getFieldNumberValue = (field: unknown): number =>
  field instanceof Array
    ? field.length
    : typeof field === "number"
    ? field
    : -Infinity;

export const checkUserRequirement = async (
  user: User,
  condition: UserRequirement["condition"]
): Promise<RequirementProgress> => {
  const { count, values } = condition;

  const valuesKeys = keys(values);
  if (valuesKeys.length === 1) {
    const key = valuesKeys[0];

    return {
      value: getFieldNumberValue(user[key]),
      count: values[key] ?? 0,
    };
  }

  const results = ramdaValues(
    mapObjIndexed(
      (value, field) => getFieldNumberValue(user[field]) >= value,
      values
    )
  );
  const value = results.filter((result) => result).length;

  return { value, count };
};

export const checkLessonRequirement = async (
  lessonsDal: LessonsDal,
  userId: string,
  condition: LessonRequirement["condition"]
): Promise<RequirementProgress> => {
  const { values, count } = condition;
  const filter: RootFilterQuery<Lesson> = {
    owner: userId,
    ...createMongooseFindQueryToRequirementCondition(values),
  };
  const progress = await lessonsDal.find(filter).countDocuments();

  return { value: progress, count };
};
