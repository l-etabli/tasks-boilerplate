import { expect } from "vitest";

export const expectToEqual = <T>(actual: T, expected: T): void => {
  expect(actual).toEqual(expected);
};

export const expectPromiseToFailWith = async <T>(
  promise: Promise<T>,
  message: string,
): Promise<void> => {
  await expect(promise).rejects.toThrow(message);
};

export const clearAndAssign = <T>(
  target: Record<string, T>,
  values: T[],
  getKey: (value: T) => string,
): void => {
  Object.keys(target).forEach((key) => {
    delete target[key];
  });
  Object.assign(
    target,
    Object.fromEntries(values.map((value) => [getKey(value), value])),
  );
};
