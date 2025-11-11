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
