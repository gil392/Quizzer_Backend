import { RootFilterQuery } from "mongoose";
import { mapObjIndexed, values as ramdaValues } from "ramda";
import { LessonsDal } from "../../lesson/dal";
import { PublicUser } from "../../user/model";
import { LessonRequirement, UserRequirement } from "../types";
import { Lesson } from "../../lesson/model";

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

export const checkUserRequirement = async (
  user: PublicUser,
  condition: UserRequirement["condition"]
) => {
  const { count, values } = condition;
  const results = ramdaValues(
    mapObjIndexed((value, field) => {
      const fieldValue = user[field];

      return fieldValue instanceof Array
        ? fieldValue.length >= value
        : typeof fieldValue === "number"
        ? fieldValue >= value
        : false;
    }, values)
  );

  return count / results.filter((result) => result).length;
};

export const checkLessonRequirement = async (
  lessonsDal: LessonsDal,
  userId: string,
  condition: LessonRequirement["condition"]
) => {
  const { values, count } = condition;
  const filter: RootFilterQuery<Lesson> = {
    owner: userId,
    ...createMongooseFindQueryToRequirementCondition(values),
  };
  const results = await lessonsDal.find(filter).countDocuments();

  return count / results;
};
